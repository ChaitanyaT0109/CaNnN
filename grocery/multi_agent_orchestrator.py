from typing import Optional, List
from moya.orchestrators.base_orchestrator import BaseOrchestrator
from moya.registry.agent_registry import AgentRegistry
from moya.classifiers.base_classifier import BaseClassifier
from moya.tools.ephemeral_memory import EphemeralMemory

class SimpleClassifier(BaseClassifier):
    """
    A classifier that maps API requests to appropriate agents based on keywords.
    """

    def classify(self, message: str, thread_id: str, available_agents: list) -> list:
        if "predict consumption" in message.lower():
            return ["prediction_consumption_agent"]
        elif "predict expiry" in message.lower():
            return ["predict_expiry_agent"]
        elif "shopping list" in message.lower():
            return ["suggest_shopping_list_agent"]
        elif "similar products" in message.lower():
            return ["suggest_similar_products_agent"]
        elif "health check" in message.lower():
            return ["health_agent"]
        else:
            return [self.default_agent_name] if self.default_agent_name else []

class MultiAgentOrchestrator(BaseOrchestrator):
    """
    An orchestrator that intelligently routes messages to multiple agents based on a classifier.
    """

    def __init__(
        self,
        agent_registry: AgentRegistry,
        classifier: BaseClassifier,
        default_agent_name: Optional[str] = None,
        config: Optional[dict] = None
    ):
        """
        :param agent_registry: The registry to retrieve agents from.
        :param classifier: The classifier used for selecting the appropriate agent(s).
        :param default_agent_name: The fallback agent if classification fails.
        :param config: Optional configuration dictionary.
        """
        super().__init__(agent_registry=agent_registry, config=config)
        self.classifier = classifier
        self.default_agent_name = default_agent_name

    def orchestrate(self, thread_id: str, user_message: str, stream_callback=None, **kwargs) -> str:
        """
        Orchestrates message handling by routing to multiple agents if necessary.

        :param thread_id: Conversation thread ID.
        :param user_message: The incoming message from the user.
        :param stream_callback: Optional callback for streaming responses.
        :param kwargs: Additional parameters.
        :return: Aggregated response from selected agents.
        """
        available_agents = self.agent_registry.list_agents()
        if not available_agents:
            return "[No agents available to handle message.]"

        # Classify and determine relevant agents
        agent_names: List[str] = kwargs.get("agent_names", [])
        if not agent_names:
            agent_names = self.classifier.classify(
                message=user_message,
                thread_id=thread_id,
                available_agents=available_agents
            )

        # Ensure we have agents to route to
        if not agent_names and self.default_agent_name:
            agent_names = [self.default_agent_name]

        responses = []
        for agent_name in agent_names:
            agent = self.agent_registry.get_agent(agent_name)
            if not agent:
                continue

            EphemeralMemory.store_message(thread_id=thread_id, sender="user", content=user_message)

            # Handle message with streaming support
            agent_prefix = f"[{agent.agent_name}] "
            if stream_callback:
                stream_callback(agent_prefix)
                response = agent_prefix
                message_stream = agent.handle_message_stream(user_message, thread_id=thread_id, **kwargs) or []
                for chunk in message_stream:
                    stream_callback(chunk)
                    response += chunk
            else:
                response = agent_prefix + agent.handle_message(user_message, thread_id=thread_id, **kwargs)

            EphemeralMemory.store_message(thread_id=thread_id, sender=agent.agent_name, content=response)
            responses.append(response)

        return "\n".join(responses) if responses else "[No suitable agents found to handle message.]"
