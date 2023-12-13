from core.application import BaseApplication


class Application(BaseApplication):
    """Paintstorch"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["hand_sign"] = ["sign"]
        self.requires["paintstorch"] = ["painted_image"]
        self.requires["calibration"] = ["successful_calibration_data"]

        self.hand_pose_data = {}

        @self.server.sio.on("application-paintstorch-paint")
        def paint(data):
            """Starts the calibration process of painting"""
            self.execute("paintstorch", "paint_image", data)


        @self.server.sio.on("application-paintstorch-get_calibration_data")
        def get_calibration_data():
            """Gets the calibration data"""
            data = self.hal.get_driver_event_data("calibration", "successful_calibration_data")
            self.server.send_data(self.name, {"type": "calibration", "data": data})


    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data
            self.server.send_data(self.name, {"type": "hand_pose", "data": self.hand_pose_data})

        if source == "calibration" and event == "successful_calibration_data" and data is not None:
            self.server.send_data(self.name, {"type": "calibration", "data": data})
