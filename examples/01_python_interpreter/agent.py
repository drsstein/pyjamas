import numpy as np

class Agent():
    def __init__(self):
        pass
        
    def reset(self):
        self.x = np.zeros(2)
        return self.x
        
    def step(self, action):
        self.x += action
        return self.x
        
agent = Agent()
a = agent.reset()
agent.step([1,1])