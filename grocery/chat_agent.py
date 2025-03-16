import os
import requests
from moya.conversation.thread import Thread
from moya.tools.base_tool import BaseTool
from moya.tools.ephemeral_memory import EphemeralMemory
from moya.tools.tool_registry import ToolRegistry
from moya.registry.agent_registry import AgentRegistry
from moya.orchestrators.simple_orchestrator import SimpleOrchestrator
from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.conversation.message import Message

FASTAPI_URL = "http://127.0.0.1:8000"

def predict_consumption(item_name: str) -> str:
    """ Fetch consumption prediction from FastAPI """
    response = requests.get(f"{FASTAPI_URL}/predict/{item_name}")
    if response.status_code == 200:
        return response.json()["prediction"]
    else:
        return response.json()["detail"]

def setup_agent():
    """ Set up the AI agent with the consumption prediction tool """

    tool_registry = ToolRegistry()
    EphemeralMemory.configure_memory_tools(tool_registry)

    predict_consumption_tool = BaseTool(
        name="predict_consumption_tool",
        description="Predict when an item will run out based on consumption habits",
        function=predict_consumption,
        parameters={
            "item_name": {
                "type": "string",
                "description": "The item name for consumption prediction"
            }
        },
        required=["item_name"]
    )
    tool_registry.register_tool(predict_consumption_tool)

    agent_config = AzureOpenAIAgentConfig(
        agent_name="consumption_chat_agent",
        description="AI agent for consumption prediction",
        model_name="gpt-4o",
        agent_type="ChatAgent",
        tool_registry=tool_registry,
        system_prompt="""
            You are an AI assistant that predicts when an item will run out based on user consumption habits.
            Use the 'predict_consumption_tool' to fetch predictions.
        """,
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_base=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION") or "2024-12-01-preview",
    )

    agent = AzureOpenAIAgent(config=agent_config)
    agent_registry = AgentRegistry()
    agent_registry.register_agent(agent)

    orchestrator = SimpleOrchestrator(agent_registry=agent_registry, default_agent_name="consumption_chat_agent")
    return orchestrator, agent

def main():
    orchestrator, agent = setup_agent()

    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in ['quit', 'exit']:
            print("\nGoodbye!")
            break

        response = orchestrator.orchestrate(
            thread_id="consumption_chat_001",
            user_message=user_input
        )

        print("\nAssistant:", response)

if __name__ == "__main__":
    main()
