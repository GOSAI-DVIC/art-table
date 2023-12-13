from core.application import BaseApplication


class Application(BaseApplication):
    """Life as a Boid"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["calibration"] = ["successful_calibration_data"]

        @self.server.sio.on("application-life_as_a_boid-get_calibration_data")
        def get_calibration_data():
            """Gets the calibration data"""
            data = self.hal.get_driver_event_data("calibration", "successful_calibration_data")
            self.server.send_data(self.name, {"type": "calibration", "data": data})

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.server.send_data(self.name, {"type": "hand_pose", "data": data})

        if source == "calibration" and event == "successful_calibration_data":
            if data is not None:
                self.server.send_data(self.name, {"type": "calibration", "data": data})
            else:
                self.server.send_data(self.name, {"type": "calibration", "data": {"ids": [], "coords": []}})
