from core.application import BaseApplication


class Application(BaseApplication):
    """Fiber Body"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["calibration"] = ["calibration_data"]
        self.requires["interpolate"] = ["interpolated_data"]
        self.hand_pose_data = {}
        self.interpolation = {
            "name": "interpolated_show_hands",
            "amount": 2,
            "duration": 0.016,
            "points": [],
            "factor": 0.5,
            "depth": 2,
        }

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "calibration" and event == "calibration_data" and data is not None:
            if data["coords"] != []:
                self.server.send_data(self.name, {"type": "calibration", "data": data})

        if source == "hand_pose" and event == "raw_data" and data is not None:
            # self.server.send_data(self.name, data)
            # self.hand_pose_data = data
            self.hand_pose_data["hands_handedness"] = data["hands_handedness"]
            self.hand_pose_data["frame_size"] = data["frame_size"]
            self.interpolation["points"] = data["hands_landmarks"]
            self.execute(
                "interpolate",
                "interpolate_points",
                self.interpolation
            )

        if source == "pose" and event == "raw_data" and data is not None:
            self.hand_pose_data["hands_handedness"] = [["right", 1], ["left", 1]]
            self.interpolation["points"] = [data["right_hand_pose"], data["left_hand_pose"]]
            self.execute(
                "interpolate",
                "interpolate_points",
                self.interpolation
            )

        if (
            source == "interpolate"
            and event == "interpolated_data"
            and data is not None
            and "name" in data
            and data["name"] == "interpolated_show_hands"
        ):
            self.hand_pose_data["hands_landmarks"] = data["points"]
            self.server.send_data(self.name, {"type": "hand_pose", "data": self.hand_pose_data})
