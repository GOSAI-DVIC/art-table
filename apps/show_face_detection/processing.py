from core.application import BaseApplication


class Application(BaseApplication):
    """Face pose display"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["face_detection"] = ["interpolated_detection"]
        self.i = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "face_detection" and event == "interpolated_detection" and data is not None:
            self.server.send_data(self.name, data)
            # if self.i % 3 == 0:
            # self.i += 1
