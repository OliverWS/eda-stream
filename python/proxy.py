#! /usr/bin/python
from glob import glob
import logging
import sys
import os
import optparse
import exceptions
import serial
import time
import urllib
import urllib2
import json
from multiprocessing import Pool, Process, Lock
def push(packets, host):
	try:
		data = {"packets":[], "count":len(packets)}
		for packet in packets:
			data["packets"].append({"payload":packet})
		post_data = urllib.urlencode({"data":json.dumps(data)})
		req = urllib2.Request(host,data=post_data)
		urllib2.urlopen(req)
	except exceptions.Exception as e:
		logging.error("Problem pushing packet to host: %s"%(host))
		logging.error(str(e))		

class proxy:
	def __init__(self, port, url,opts={}, retries=10):
		self.host = url
		self.opts = opts
		self.port = port
		self.serial_connected = False
		self.serial = self.serial_connect(port, retries)
		self.thread_count = 1
		self.debug = True
		self.lock = Lock()
		self.threads = Pool(processes=1) #
		self.run = False
	
	def start(self):
		self.run = True
		self.poll();
	
	def poll(self):
		n = 0
		while (n==0 or self.serial_connect(self.port,retries=10) != False) and self.run:
			self.serial.flush()
			try:
				try:
					buffer = []
					for line in self.serial:
						if not self.run:
							self.threads.close()
							break
						n += 1
						if self.debug:
							logging.info(">>" + line)
						buffer.append(line)
						if n%self.opts.downsample == 0:
							self.threads.apply_async(push, [buffer, self.host])
							buffer = []
				except (serial.SerialException, serial.SerialTimeoutException, IOError):
					self.serial_connected = False
					logging.error("Lost connection... retrying")
			except (KeyboardInterrupt, SystemExit):
			    logging.warning("Exiting...")
			    self.run = False
			    self.threads.close()				
		
	
	def serial_connect(self, port, retries=10):
		def fib(n):
		    if n == 0:
		        return 0
		    elif n == 1:
		        return 1
		    else:
		        return fib(n-1) + fib(n-2)
		
		for tries in range(0,retries):
			try:
				ser = serial.Serial(port, 115200)
				self.serial_connected = True
				logging.info("Connected to %s"%(port))
				break
			except exceptions.Exception as e:
				logging.error("Error connecting to serial port %s. Try #%d"%(port,tries))
				time.sleep(fib(tries))
		if self.serial_connected:
			logging.info("Connected to sensor: %s"%(port))
			self.serial = ser
			return self.serial
		else:
			logging.error("Could not connect to serial port: %s"%(port))
			return False
	
				
			
		

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.WARN, format="%(asctime)s - %(levelname)s - %(message)s")
    parser = optparse.OptionParser()
    parser.add_option('--sensor', '-q', default=None, help="MAC Address of sensor to connect to")
    parser.add_option('--remote', '-r', default="http://live.ollie.ws", help="Remote host")
    parser.add_option('--downsample', '-d', default=4, type=int, help="Amount to downsample")
    options, arguments = parser.parse_args()
    
    port = "/dev/tty.AffectivaQ-v2-%s-SPP"%(options.sensor)
    p = proxy(port, options.remote, options)
    p.start()
    
    
    