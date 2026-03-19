import sys
import traceback
from main import run_anoboy

sys.stdout = open('crash.log', 'w', encoding='utf-8')
sys.stderr = sys.stdout

try:
    print("Testing 5 limits to catch the crash...")
    run_anoboy(limit=5)
    print("DONE without crash")
except Exception as e:
    print("CRASHED!")
    traceback.print_exc()

sys.stdout.flush()
sys.stdout.close()
