import math
import numpy as np
from core.application import BaseApplication


class Application(BaseApplication):
    """Parrot Synth"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["frequency_analysis"] = ["frequency"]
        self.requires["speaker"] = ["play", "settings"]

        self.phase = 0
        self.signal = []
        self.speaker_settings = None

    def listener(self, source, event, data):
        super().listener(source, event, data)

        if self.speaker_settings is None:
            self.speaker_settings = self.get_driver_event_data("speaker", "settings")

        if source == "frequency_analysis" and event == "frequency" and data is not None:
            max_frequency = data["max_frequency"]
            amplitude = data["amplitude"]
            blocksize = data["blocksize"]
            samplerate = 44100
            if amplitude > 100:
                # print(max_frequency)
                self.signal.extend([0.8 * math.sin(2*math.pi*max_frequency*x/samplerate + self.phase) for x in range(blocksize)])
                self.phase = (2*math.pi*max_frequency*blocksize/samplerate + self.phase) % (2*math.pi)
                if self.speaker_settings is not None and self.speaker_settings["blocksize"] <= len(self.signal):
                    signal = np.array(self.signal)
                    self.execute(driver="speaker", action="play", data=signal)
                    self.signal = []
