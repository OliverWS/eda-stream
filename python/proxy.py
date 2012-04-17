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

class proxy:
	def __init__(self, port, url,opts={}, retries=10):
		self.host = url
		self.opts = opts
		self.serial_connected = False
		self.serial = self.serial_connect(port, retries)
		self.run = False
	
	def start(self):
		self.run = True
		self.poll();
	
	def poll(self):
		n = 0
		self.serial.flush()
		for line in self.serial:
			n += 1
			if n%self.opts.downsample == 0:
				t1 = time.time()
				self.push(line)
				print "Delay: %f"%(time.time()-t1)
		
	def push(self,packet):
		try:
			data = {"payload":packet}
			req = urllib2.Request(self.host,data=urllib.urlencode(data))
			urllib2.urlopen(req)
		except exceptions.Exception as e:
			logging.error("Problem pushing packet to host: %s"%(self.host))
			logging.error(str(e))		
	
	def serial_connect(self, port, retries=10):
		for tries in range(0,retries):
			try:
				ser = serial.Serial(port, 115200)
				self.serial_connected = True
				logging.info("Connected to %s"%(port))
				break
			except exceptions.Exception as e:
				logging.error("Error connecting to serial port %s. Try #%d"%(port,tries))
				time.sleep(1)
		if self.serial_connected:
			return ser
		else:
			return False
	
				
			
		

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.WARN, format="%(asctime)s - %(levelname)s - %(message)s")
    parser = optparse.OptionParser()
    parser.add_option('--sensor', '-q', default=None, help="MAC Address of sensor to connect to")
    parser.add_option('--remote', '-r', default="http://live.ollie.ws", help="Remote host")
    parser.add_option('--downsample', '-d', default=4, help="Amount to downsample")
    options, arguments = parser.parse_args()
    
    port = "/dev/tty.AffectivaQ-v2-%s-SPP"%(options.sensor)
    p = proxy(port, options.remote, options)
    p.start()
    
    
    