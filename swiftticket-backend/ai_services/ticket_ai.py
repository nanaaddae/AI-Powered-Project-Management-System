# ai_services/ticket_ai.py
import requests
import json
from django.conf import settings
from tickets.models import Ticket
from users.models import UserProfile


class LMStudioClient:
    def __init__(self, base_url=None):
        self.base_url = base_url or settings.LMSTUDIO_BASE_URL

    def generate_text(self, prompt, max_tokens=500):
        """Use this for simple prompt-completion (old style)"""
        try:
            response = requests.post(
                f"{self.base_url}/v1/completions",
                json={
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": 0.3,
                    "stop": ["\n\n"]
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["text"].strip()
        except requests.exceptions.RequestException as e:
            print(f"LMStudio API error: {e}")
            raise

    def chat_completion(self, messages, max_tokens=500):
        """Use this for chat format (new style)"""
        print(f"Sending request to LMStudio at {self.base_url}...")
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                json={
                    "model": "meta-llama-3-8b-instruct",
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.3,
                },
                timeout=45
            )
            response.raise_for_status()

            # DEBUG: Print the actual response
            response_data = response.json()
            print(f"LMStudio Response: {json.dumps(response_data, indent=2)}")

            # Check if response has the expected format
            if "choices" not in response_data:
                raise ValueError(f"Unexpected response format from LMStudio: {response_data}")

            return response_data["choices"][0]["message"]["content"].strip()

        except requests.exceptions.RequestException as e:
            print(f"LMStudio Error Detail: {e.response.text if hasattr(e, 'response') and e.response else e}")
            raise

class TicketAIService:
    def __init__(self):
        self.llm = LMStudioClient()

    def generate_summary(self, description):
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes software development tickets. Provide clear, concise summaries in 2-3 sentences."
            },
            {
                "role": "user",
                "content": f"Summarize this ticket description in 2-3 sentences:\n\n{description}"
            }
        ]

        try:
            return self.llm.chat_completion(messages, max_tokens=150)
        except:
            # Fallback to simple prompt if chat completion fails
            prompt = f"Summarize the following ticket in 2-3 sentences:\n\n{description}\n\nSummary:"
            return self.llm.generate_text(prompt, max_tokens=150)

    def classify_ticket(self, title, description):
        # First, check for obvious cases where AI consistently fails
        obvious_override = self._obvious_keyword_override(title, description)
        if obvious_override:
            print("🎯 Using obvious keyword override")
            return obvious_override

        # Otherwise, use AI with sanity checks
        return self._ai_classify_with_sanity_checks(title, description)

    def _obvious_keyword_override(self, title, description):
        """Handle cases where AI is consistently completely wrong"""
        text = f"{title} {description}".lower()

        # Docker/DevOps stuff (AI consistently thinks this is frontend)
        if any(word in text for word in ['docker', 'ci/cd', 'pipeline', 'deploy', 'server', 'kubernetes', 'container']):
            return {
                'type': 'bug' if any(w in text for w in ['fail', 'broken', 'error', 'crash']) else 'task',
                'priority': 'high' if any(w in text for w in ['fail', 'broken', 'crash']) else 'medium',
                'component': 'devops'
            }

        # Database stuff (AI sometimes misclassifies)
        if any(word in text for word in ['database', 'sql', 'query', 'postgres', 'mysql', 'mongodb', 'schema']):
            return {
                'type': 'bug' if any(w in text for w in ['slow', 'fail', 'error', 'corrupt']) else 'task',
                'priority': 'high' if any(w in text for w in ['fail', 'corrupt', 'down']) else 'medium',
                'component': 'database'
            }

        # Obvious low-priority items (AI overrates these)
        if any(word in text for word in ['copyright', 'footer', 'typo', 'readme', 'whitespace', 'formatting']):
            return {
                'type': 'task',
                'priority': 'low',
                'component': 'frontend' if any(w in text for w in ['footer', 'typo']) else 'backend'
            }

        # Obvious critical issues (AI sometimes underrates these)
        if any(word in text for word in ['down', 'crash', '500 error', 'security breach', 'data loss', 'cannot login']):
            return {
                'type': 'bug',
                'priority': 'critical',
                'component': self._guess_component(title, description)
            }

        return None

    def _ai_classify_with_sanity_checks(self, title, description):
        """Use AI classification but with sanity checks"""
        messages = [
            {
                "role": "system",
                "content": """You are a ticket classification expert for a software development team. 

TYPE GUIDELINES:
- BUG: Something is broken, not working as expected, errors, crashes, malfunctions
- FEATURE: Brand new functionality, completely new capability, net-new feature
- IMPROVEMENT: Enhancement to existing functionality, making something better, optimization
- TASK: General work, administrative tasks, refactoring, technical debt, maintenance

PRIORITY GUIDELINES (BE SPECIFIC - DON'T DEFAULT TO MEDIUM):
- CRITICAL: System completely down, data loss, security breach, no workaround, affects ALL users
- HIGH: Major feature broken, significant revenue impact, many users affected, difficult workaround
- MEDIUM: Some users affected, workaround exists, noticeable but not blocking
- LOW: Cosmetic, minor improvement, affects few users, nice-to-have

COMPONENT GUIDELINES:
- FRONTEND: User interface, buttons, forms, CSS, HTML, React components, styling, layout, themes
- BACKEND: Server logic, business rules, data processing, authentication, core application logic
- API: REST endpoints, GraphQL, data exchange between services, request/response formats
- DATABASE: Queries, schema, migrations, data storage, PostgreSQL/MySQL
- MOBILE: iOS/Android apps, mobile-specific features
- DEVOPS: Servers, deployment, Docker, CI/CD, infrastructure

Always return valid JSON with: type, priority, component"""
            },
            {
                "role": "user",
                "content": f"""Classify this ticket:

Title: {title}
Description: {description}

Return ONLY JSON:"""
            }
        ]

        try:
            result = self.llm.chat_completion(messages, max_tokens=150)

            print("\n" + "=" * 60)
            print(f"Raw AI Response: '{result}'")
            print("=" * 60 + "\n")

            # Extract JSON from response
            result = result.strip()
            start = result.find('{')
            end = result.rfind('}') + 1

            if start == -1 or end == 0:
                print("No JSON found in response, using fallback")
                return self._classify_by_keywords(title, description)

            json_str = result[start:end]
            classification = json.loads(json_str)

            # Validate the response
            valid_types = ['bug', 'feature', 'improvement', 'task']
            valid_priorities = ['low', 'medium', 'high', 'critical']
            valid_components = ['frontend', 'backend', 'api', 'database', 'mobile', 'devops']

            final_type = classification.get('type', 'task')
            if final_type not in valid_types:
                final_type = self._guess_type(title, description)

            final_priority = classification.get('priority', 'medium')
            if final_priority not in valid_priorities:
                final_priority = self._detect_priority(title, description)

            final_component = classification.get('component', 'backend')
            if final_component not in valid_components:
                final_component = self._guess_component(title, description)

            classification = {
                'type': final_type,
                'priority': final_priority,
                'component': final_component
            }

            # Apply sanity check overrides
            classification = self._sanity_check_override(title, description, classification)

            return classification

        except Exception as e:
            print(f"Error in AI classification: {e}")
            return self._classify_by_keywords(title, description)

    def _sanity_check_override(self, title, description, classification):
        """Fix obviously wrong AI classifications with sanity checks"""
        text = f"{title} {description}".lower()

        # Component sanity checks
        if any(word in text for word in ['docker', 'ci/cd', 'pipeline', 'deploy', 'kubernetes']):
            if classification['component'] == 'frontend':
                print("🔧 SANITY: Docker issue cannot be frontend, overriding to devops")
                classification['component'] = 'devops'

        if any(word in text for word in ['database', 'sql', 'query', 'postgres', 'mysql']):
            if classification['component'] == 'frontend':
                print("🔧 SANITY: Database issue cannot be frontend, overriding to database")
                classification['component'] = 'database'

        if any(word in text for word in ['api', 'endpoint', 'rest', 'json']):
            if classification['component'] == 'frontend':
                print("🔧 SANITY: API issue unlikely to be frontend, overriding to api")
                classification['component'] = 'api'

        # Priority sanity checks
        if any(word in text for word in ['copyright', 'footer', 'typo', 'documentation']):
            if classification['priority'] in ['high', 'critical']:
                print("🔧 SANITY: Documentation issue cannot be high priority, overriding to low")
                classification['priority'] = 'low'

        if any(word in text for word in ['down', 'crash', '500 error', 'security breach']):
            if classification['priority'] in ['low', 'medium']:
                print("🔧 SANITY: System down should not be low priority, overriding to critical")
                classification['priority'] = 'critical'

        # Type sanity checks
        if any(word in text for word in ['failing', 'broken', 'crash', 'error', 'not working']):
            if classification['type'] != 'bug':
                print("🔧 SANITY: Broken functionality should be bug, not feature/task")
                classification['type'] = 'bug'

        if any(word in text for word in ['data corrupt', 'corruption', 'data loss']):
            classification['type'] = 'bug'
            if classification['priority'] != 'critical':
                classification['priority'] = 'high'

        return classification

    def _detect_priority(self, title, description):
        """Aggressive priority detection based on keywords"""
        text = f"{title} {description}".lower()

        # Critical triggers
        if any(word in text for word in [
            'down', 'crash', '500 error', 'security breach', 'data loss',
            'cannot login', 'outage', 'emergency', 'production down', 'site down'
        ]):
            return 'critical'

        # High triggers
        elif any(word in text for word in [
            'broken', 'not working', 'blocking', 'major', 'urgent', 'customers complaining',
            'revenue', 'sales', 'checkout', 'payment', 'signup', 'registration', 'corrupt'
        ]):
            return 'high'

        # Low triggers
        elif any(word in text for word in [
            'cosmetic', 'nice to have', 'minor', 'when you have time', 'color',
            'font', 'theme', 'dark mode', 'documentation', 'typo', 'text change',
            'copyright', 'footer', 'readme'
        ]):
            return 'low'

        # Default to medium
        return 'medium'

    def _guess_type(self, title, description):
        """Guess type from keywords - updated for your types"""
        text = f"{title} {description}".lower()

        if any(word in text for word in ['bug', 'error', 'broken', 'not working', 'crash', 'fix', 'issue', 'fails', '500', '404']):
            return 'bug'
        elif any(word in text for word in ['add', 'new feature', 'implement', 'create new', 'build new']):
            return 'feature'
        elif any(word in text for word in ['improve', 'enhance', 'better', 'optimize', 'speed up', 'refactor', 'upgrade', 'dark mode', 'theme']):
            return 'improvement'
        elif any(word in text for word in ['task', 'update', 'document', 'maintenance', 'cleanup', 'review', 'test']):
            return 'task'
        return 'task'  # default to task

    def _guess_component(self, title, description):
        """Enhanced component detection with UI/theme keywords"""
        text = f"{title} {description}".lower()

        frontend_keywords = [
            'button', 'ui', 'ux', 'css', 'html', 'react', 'vue', 'angular',
            'display', 'layout', 'mobile', 'responsive', 'click', 'render',
            'component', 'page', 'screen', 'browser', 'style', 'theme',
            'dark mode', 'light mode', 'toggle', 'color', 'font', 'icon',
            'image', 'video', 'animation', 'scroll', 'menu', 'navbar',
            'safari', 'chrome', 'firefox', 'edge', 'website', 'web page'
        ]

        database_keywords = [
            'database', 'sql', 'query', 'table', 'postgres', 'mysql',
            'mongodb', 'schema', 'migration', 'index', 'query performance',
            'data storage', 'record', 'row', 'column'
        ]

        api_keywords = [
            'api', 'endpoint', 'rest', 'graphql', 'request', 'response',
            'json', 'status code', '500', '404', 'endpoint', 'integration',
            'webhook', 'post', 'get', 'put', 'delete'
        ]

        mobile_keywords = [
            'ios', 'android', 'app', 'mobile app', 'iphone', 'ipad',
            'play store', 'app store', 'mobile device', 'tablet'
        ]

        devops_keywords = [
            'deploy', 'docker', 'server', 'ci/cd', 'pipeline', 'build',
            'infrastructure', 'aws', 'azure', 'gcp', 'kubernetes', 'container',
            'monitoring', 'logs', 'server', 'hosting', 'environment'
        ]

        # Check each category with priority
        if any(word in text for word in frontend_keywords):
            return 'frontend'
        elif any(word in text for word in database_keywords):
            return 'database'
        elif any(word in text for word in api_keywords):
            return 'api'
        elif any(word in text for word in mobile_keywords):
            return 'mobile'
        elif any(word in text for word in devops_keywords):
            return 'devops'

        return 'backend'

    def _classify_by_keywords(self, title, description):
        """Pure keyword-based classification with priority detection"""
        return {
            'type': self._guess_type(title, description),
            'priority': self._detect_priority(title, description),
            'component': self._guess_component(title, description)
        }

    def test_ai_connection(self):
        """Test if AI is responding properly"""
        try:
            test_response = self.llm.chat_completion([
                {"role": "user", "content": "Just say 'AI is working'"}
            ])
            print(f"✅ AI Test Response: {test_response}")
            return True
        except Exception as e:
            print(f"❌ AI Test Failed: {e}")
            return False

    def suggest_assignee(self, ticket):
        from users.models import UserProfile

        print(f"=== SUGGEST ASSIGNEE DEBUG ===")

        # Get ALL developers in the system (not just project members)
        developers = UserProfile.objects.filter(
            user__role='developer'
        ).select_related('user')

        print(f"Found {developers.count()} developers in system")

        if not developers:
            print("❌ No developers found in system!")
            return None

        # Print developer details
        for dev_profile in developers:
            print(f"  - Developer: {dev_profile.user.username}")
            print(f"    Name: {dev_profile.user.first_name} {dev_profile.user.last_name}")
            print(f"    Expertise: {dev_profile.expertise_areas}")
            print(f"    Workload: {dev_profile.current_workload}")

        # Prepare developer information for AI
        developer_info = []
        for dev_profile in developers:
            dev = dev_profile.user
            expertise_str = ', '.join(dev_profile.expertise_areas) if dev_profile.expertise_areas else 'general development'
            info = f"- {dev.username} ({dev.first_name} {dev.last_name}): Expertise in {expertise_str}, Current workload: {dev_profile.current_workload} tickets"
            developer_info.append(info)

        prompt = f"""
    Based on the ticket details and developer information, suggest the best developer to assign this ticket to.
    Consider their expertise areas and current workload.

    Ticket Details:
    - Type: {ticket.ticket_type}
    - Component: {ticket.component}
    - Priority: {ticket.priority}
    - Title: {ticket.title}

    Available Developers:
    {chr(10).join(developer_info)}

    Return ONLY the username of the most suitable developer (just the username, nothing else):
    """

        try:
            print("Calling LMStudio for assignee suggestion...")
            suggested_username = self.llm.generate_text(prompt, max_tokens=50).strip()
            print(f"LMStudio returned: '{suggested_username}'")

            # Validate that the suggested username exists in our developers list
            valid_usernames = [dev.user.username for dev in developers]
            print(f"Valid usernames: {valid_usernames}")

            if suggested_username in valid_usernames:
                print(f"✅ Valid suggestion: {suggested_username}")
                return suggested_username
            else:
                print(f"⚠️ Invalid suggestion '{suggested_username}', using fallback")
                # Fallback: return developer with matching expertise and lowest workload
                matching_devs = [
                    dev for dev in developers
                    if ticket.component in dev.expertise_areas
                ]
                if matching_devs:
                    best_dev = min(matching_devs, key=lambda x: x.current_workload)
                    print(f"Fallback (matching expertise): {best_dev.user.username}")
                    return best_dev.user.username
                else:
                    # No matching expertise, use lowest workload
                    best_dev = min(developers, key=lambda x: x.current_workload)
                    print(f"Fallback (lowest workload): {best_dev.user.username}")
                    return best_dev.user.username
        except Exception as e:
            print(f"Error during AI suggestion: {e}")
            import traceback
            traceback.print_exc()

            # Fallback: return developer with matching expertise and lowest workload
            matching_devs = [
                dev for dev in developers
                if ticket.component in dev.expertise_areas
            ]
            if matching_devs:
                best_dev = min(matching_devs, key=lambda x: x.current_workload)
                print(f"Exception fallback (matching): {best_dev.user.username}")
                return best_dev.user.username
            else:
                best_dev = min(developers, key=lambda x: x.current_workload)
                print(f"Exception fallback (any): {best_dev.user.username}")
                return best_dev.user.username