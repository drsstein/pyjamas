import numpy as np
class MassSpringOscillator():
    
    def __init__(self, num_objects, bounds):
        self.num_objects = num_objects
        self.bounds = bounds
        self.k = 2. # spring constant
        self.b = 0.1 # damping constant
        self.dt = 0.05 # simulation time per update call
        
    def reset(self):
        self.m = 0.5 + np.random.uniform(size=self.num_objects) * 2 # mass
        self.x = 0 # position
        self.v = 0 # velocity
        return self.x
        
    def step(self, action):
        self.anchor = action
        dx = self.x - self.anchor
        f_spring = -self.k * dx
        f_friction = -self.b * self.v
        f_total = f_spring + f_friction
        a = f_total / self.m
        self.v = self.v + self.dt * a
        x = self.x + self.dt * self.v
        is_below = x < self.bounds[0]
        x[is_below] = self.bounds[0] - x[is_below]
        self.v[is_below] = -self.v[is_below]
        
        is_above = x > self.bounds[1]
        x[is_above] = 2*self.bounds[1] - x[is_above]
        self.v[is_above] = -self.v[is_above]
        
        self.x = x
        return self.x
        
agent = MassSpringOscillator(num_objects=20, bounds=[0, 800])
mouse = [0,400]
agent.reset()