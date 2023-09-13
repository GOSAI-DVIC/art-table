from core.application import BaseApplication

import time

class Application(BaseApplication):
    """interpolated_show_hands"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["pose"] = ["raw_data"]
        # self.requires["hand_pose"] = ["raw_data"]
        # self.requires["hand_sign"] = ["sign"]
        self.requires["interpolate"] = ["interpolated_data"]
        self.hand_pose_data = {}
        self.interpolation = {
            "name": "interpolated_show_hands",
            "amount": 10,
            "duration": 0.06,
            "points": [],
            "factor": 0.5,
            "depth": 2,
        }

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            # self.server.send_data(self.name, data)
            # self.hand_pose_data = data
            self.hand_pose_data["hands_handedness"] = data["hands_handedness"]
            self.interpolation["points"] = data["hands_landmarks"]
            self.execute(
                "interpolate",
                "interpolate_points",
                self.interpolation
            )

        if source == "pose" and event == "raw_data" and data is not None:
            self.hand_pose_data["hands_handedness"] = [["right", 1], ["left", 1]]
            right_hand = data["right_hand_pose"]
            left_hand = data["left_hand_pose"]
            for i in range(len(right_hand)):
                right_hand[i][0] = right_hand[i][0] / 640
                right_hand[i][1] = right_hand[i][1] / 480
            for i in range(len(left_hand)):
                left_hand[i][0] = left_hand[i][0] / 640
                left_hand[i][1] = left_hand[i][1] / 480
            self.interpolation["points"] = [right_hand, left_hand]
            self.execute(
                "interpolate",
                "interpolate_points",
                self.interpolation
            )

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data

        if (
            source == "interpolate"
            and event == "interpolated_data"
            and data is not None
            and "name" in data
            and data["name"] == "interpolated_show_hands"
        ):
            self.hand_pose_data["hands_landmarks"] = data["points"]
            self.hand_pose_data["emit_time"] = time.time()
            # if "hands_sign" in self.hand_pose_data:
            self.server.send_data(self.name, self.hand_pose_data)
