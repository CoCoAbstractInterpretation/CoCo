NUM_Thread=32
for V in $(seq 1 $NUM_Thread);
do 
  screen -S runscreen_$V -dm ./call_function_generator.py -c $V $NUM_Thread -t os_command -s -l 10 /media/data2/song/vulPackages/updated_databases/command_injection/
done
