# -*- coding:utf-8 -*-  
import simplejson as json
import sys
import os

def process_json(channel_id,input_json_file, output_json_file):  
    file_in = open(input_json_file, "r")  
    file_out = open(output_json_file, "w")  
    # load数据到变量json_data  
    json_data = json.load(file_in)  
    # 修改json中的数据  
    channel_json = {channel_id:{}}
    channel_json[channel_id] = json_data
    # 将修改后的数据写回文件  
    file_out.write(json.dumps(channel_json))
    print json.dumps(channel_json,indent=1)
    file_in.close() 
    file_out.close()  

def dict_channeinfo(info):
	channel_file = open(info,'r')
	while 1:
            line = channel_file.readline()
            if line:
                line = line.strip('\n')
                line = line.split(' ', 1 )

                #获取channel id和对应网红名
                channel_id = line[0]
                channel_name = line[1]
                input_json_file  = os.path.join('/bignox/data/noxop/','profile'+'_'+channel_name+'.json')
                output_json_file  = os.path.join('/bignox/data/noxop/','instance'+'_'+channel_name+'.json')
                process_json(channel_id,input_json_file, output_json_file) 
                #process_json('C2k1RYfNygE13tlMG5HGPiQ','./profile_woossiiii.json','./instance_woossiiii.json')
                
	    else:
	        break
        
        channel_file.close()
    

if __name__ == '__main__':
     dict_channeinfo("./test")

