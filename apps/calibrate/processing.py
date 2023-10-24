from core.application import BaseApplication


class Application(BaseApplication):
    """Calibrate"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["calibration"] = ["calibrate_display_focus", "calibrate_camera_display", "calibration_data"]
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["hand_sign"] = ["sign"]

        self.hand_pose_data = {}

        @self.server.sio.on("application-calibrate-calibrate_camera_display")
        def calibrate_camera_display(aruco_display_coords):
            """Starts the calibration process for the camera to display matrix"""
            self.execute("calibration", "calibrate_camera_display", aruco_display_coords)

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "calibration" and event == "calibration_data" and data is not None:
            if len(data["coords"]) > 0:
                self.server.send_data(self.name, {"type": "calibration", "data": data})

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data
            self.server.send_data(self.name, {"type": "hand_pose", "data": self.hand_pose_data})
