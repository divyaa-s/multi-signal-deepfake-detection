import os
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(BASE_DIR, "backend", "static", "test_plots")
os.makedirs(output_dir, exist_ok=True)

plt.figure()
plt.plot(np.random.rand(10))
plt.title("Test Plot")
save_path = os.path.join(output_dir, "test.png")
plt.savefig(save_path)
print(f"Saved to {save_path}")
print(f"File exists: {os.path.exists(save_path)}")
