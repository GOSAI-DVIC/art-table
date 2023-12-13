from core.application import BaseApplication


class Application(BaseApplication):
    """Face pose display"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["face_pose"] = ["faces_landmarks"]

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "face_pose" and event == "faces_landmarks" and data is not None:
            self.server.send_data(self.name, data)
