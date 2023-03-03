from core.application import BaseApplication
import time

class Application(BaseApplication):
    """walking_dog : demo application for state machine structure"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.is_exclusive = True
        self.applications_allowed = ["show_hands"]
        self.applications_required = ["show_hands"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data
            self.server.send_data(self.name, self.hand_pose_data)