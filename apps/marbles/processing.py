from core.application import BaseApplication


class Application(BaseApplication):
    """Marbles"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        # self.requires["pose"] = ["raw_data"]
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["interpolate"] = ["interpolated_data"]

        self.interpolation = {
            "name": "interpolated_marbles",
            "amount": 3,
            "duration": 0.033,
            "points": [],
            "factor": 0.5,
            "depth": 2,
        }

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "pose" and event == "raw_data" and data is not None:
            # self.server.send_data(
            #     self.name,
            #     {
            #         "right_hand_pose": data["right_hand_pose"],
            #         "left_hand_pose": data["left_hand_pose"],
            #     },
            # )
            self.interpolation["points"] = [
                data["right_hand_pose"],
                data["left_hand_pose"],
            ]
            self.execute("interpolate", "interpolate_points", self.interpolation)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            # self.server.send_data(self.name, data)
            self.interpolation["points"] = data["hands_landmarks"]
            self.execute("interpolate", "interpolate_points", self.interpolation)

        if (
            source == "interpolate"
            and event == "interpolated_data"
            and data is not None
            and "name" in data
            and data["name"] == "interpolated_marbles"
        ):
            self.server.send_data(self.name, {"hands_landmarks": data["points"]})
