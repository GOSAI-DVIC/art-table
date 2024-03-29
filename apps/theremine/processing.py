from core.application import BaseApplication


class Application(BaseApplication):
    """Theremine"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["synthesizer"] = ["synthesizing"]
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["hand_sign"] = ["sign"]
        self.hand_pose_data = {}

        @self.server.sio.on("theremine_play_wave")
        def play_wave(data):
            self.execute("synthesizer", "play_synth", data)

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data
            self.server.send_data(self.name, self.hand_pose_data)
