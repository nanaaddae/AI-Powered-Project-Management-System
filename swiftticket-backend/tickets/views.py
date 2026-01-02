from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Ticket, Comment
from .serializers import TicketSerializer, TicketUpdateSerializer, CommentSerializer
from .permissions import IsTicketParticipant, CanCreateTicket, CanAssignTicket
from ai_services.ticket_ai import TicketAIService
from activity_log.utils import log_activity  # Add this import


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsTicketParticipant]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'admin':
            return Ticket.objects.all()
        elif user.role == 'project_manager':
            return Ticket.objects.filter(project__members=user)
        else:  # developer
            return Ticket.objects.filter(
                Q(assigned_to=user) | Q(created_by=user)
            )

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [CanCreateTicket]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Create ticket and log activity"""
        ticket = serializer.save(created_by=self.request.user)

        # Log activity
        log_activity(
            user=self.request.user,
            action_type='ticket_created',
            description=f'Created ticket #{ticket.id}: {ticket.title}',
            ticket=ticket,
            project=ticket.project,
            metadata={
                'priority': ticket.priority,
                'ticket_type': ticket.ticket_type,
                'status': ticket.status
            }
        )

    def perform_update(self, serializer):
        """Update ticket and log changes"""
        old_ticket = self.get_object()
        ticket = serializer.save()

        # Track what changed
        changes = {}

        # Check for status change
        if old_ticket.status != ticket.status:
            log_activity(
                user=self.request.user,
                action_type='status_changed',
                description=f'Changed status from {old_ticket.status} to {ticket.status}',
                ticket=ticket,
                project=ticket.project,
                metadata={
                    'old_status': old_ticket.status,
                    'new_status': ticket.status
                }
            )

        # Check for priority change
        if old_ticket.priority != ticket.priority:
            log_activity(
                user=self.request.user,
                action_type='priority_changed',
                description=f'Changed priority from {old_ticket.priority} to {ticket.priority}',
                ticket=ticket,
                project=ticket.project,
                metadata={
                    'old_priority': old_ticket.priority,
                    'new_priority': ticket.priority
                }
            )

        # Check for assignment change
        if old_ticket.assigned_to != ticket.assigned_to:
            if ticket.assigned_to:
                log_activity(
                    user=self.request.user,
                    action_type='assigned',
                    description=f'Assigned to {ticket.assigned_to.first_name} {ticket.assigned_to.last_name}',
                    ticket=ticket,
                    project=ticket.project,
                    metadata={
                        'assigned_to': ticket.assigned_to.username
                    }
                )
            else:
                log_activity(
                    user=self.request.user,
                    action_type='unassigned',
                    description=f'Unassigned from {old_ticket.assigned_to.first_name} {old_ticket.assigned_to.last_name}',
                    ticket=ticket,
                    project=ticket.project,
                    metadata={
                        'was_assigned_to': old_ticket.assigned_to.username if old_ticket.assigned_to else None
                    }
                )

        # Log general update if title or description changed
        if old_ticket.title != ticket.title or old_ticket.description != ticket.description:
            log_activity(
                user=self.request.user,
                action_type='ticket_updated',
                description=f'Updated ticket #{ticket.id}',
                ticket=ticket,
                project=ticket.project
            )

    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Get tickets assigned to current user"""
        tickets = self.get_queryset().filter(assigned_to=request.user)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update ticket status (for developers)"""
        ticket = self.get_object()
        old_status = ticket.status
        new_status = request.data.get('status')

        if new_status not in dict(Ticket.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.status = new_status
        ticket.save()

        # Log status change
        log_activity(
            user=request.user,
            action_type='status_changed',
            description=f'Changed status from {old_status} to {new_status}',
            ticket=ticket,
            project=ticket.project,
            metadata={
                'old_status': old_status,
                'new_status': new_status
            }
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    # AI Features (keep existing code...)
    @action(detail=True, methods=['post'])
    def ai_summarize(self, request, pk=None):
        """AI Feature 1: Generate summary for ticket"""
        ticket = self.get_object()

        print(f"=== AI SUMMARIZE DEBUG ===")
        print(f"Ticket ID: {ticket.id}")
        print(f"Description: {ticket.description[:100]}...")

        ai_service = TicketAIService()

        try:
            print("Calling generate_summary...")
            summary = ai_service.generate_summary(ticket.description)
            print(f"Summary received: {summary}")

            summary = summary.strip().strip('"').strip("'")

            ticket.summary = summary
            ticket.save()

            return Response({
                'summary': summary,
                'message': 'Summary generated successfully'
            })
        except Exception as e:
            import traceback
            print(f"ERROR: {str(e)}")
            print(traceback.format_exc())

            return Response(
                {'error': f'AI summarization failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def ai_classify(self, request):
        """AI Feature 2: Classify ticket from title and description"""
        title = request.data.get('title', '')
        description = request.data.get('description', '')

        if not title and not description:
            return Response(
                {'error': 'Title or description required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ai_service = TicketAIService()

        try:
            classification = ai_service.classify_ticket(title, description)
            return Response(classification)
        except Exception as e:
            return Response(
                {'error': f'AI classification failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def ai_suggest_assignee(self, request, pk=None):
        """AI Feature 3: Suggest best developer for ticket"""
        ticket = self.get_object()
        ai_service = TicketAIService()

        try:
            print(f"=== AI SUGGEST ASSIGNEE DEBUG ===")
            print(f"Ticket ID: {ticket.id}")
            print(f"Ticket Type: {ticket.ticket_type}")
            print(f"Ticket Component: {ticket.component}")
            print(f"Ticket Priority: {ticket.priority}")

            suggested_username = ai_service.suggest_assignee(ticket)

            print(f"Suggested username: {suggested_username}")

            return Response({'suggested_assignee': suggested_username})
        except Exception as e:
            import traceback
            print(f"ERROR in ai_suggest_assignee: {str(e)}")
            print(traceback.format_exc())

            return Response(
                {'error': f'AI assignment suggestion failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsTicketParticipant]

    def get_queryset(self):
        return Comment.objects.filter(ticket_id=self.kwargs['ticket_pk'])

    def perform_create(self, serializer):
        ticket = Ticket.objects.get(id=self.kwargs['ticket_pk'])
        comment = serializer.save(user=self.request.user, ticket=ticket)

        # Log comment activity
        log_activity(
            user=self.request.user,
            action_type='comment_added',
            description=f'Added a comment on #{ticket.id}: {ticket.title}',
            ticket=ticket,
            project=ticket.project,
            metadata={'comment_preview': comment.content[:100]}
        )