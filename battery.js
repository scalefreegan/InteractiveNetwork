function Battery(emptyBatterySrc, fullBatterySrc, batteryWidth, batteryHeight)
{
 
	this.batteryHeight = batteryHeight;
	this.batteryWidth = batteryWidth;
 
	this.emptyBatteryElement = null;
	this.domElement = null;
    
    this.batteryValue = 0;
 
	this.init(emptyBatterySrc, fullBatterySrc);
}
Battery.prototype.init = function(emptyBatterySrc, fullBatterySrc)
{
	var el = document.createElement('div');
	el.style.position = 'relative';
 
	var fullImage = document.createElement('img');
	fullImage.style.position = 'absolute';
	fullImage.src = fullBatterySrc;
 
	this.emptyBatteryElement = document.createElement('div');
	this.emptyBatteryElement.style.position = 'absolute';
	this.emptyBatteryElement.style.overflow = 'hidden';
	this.emptyBatteryElement.style.width = this.batteryWidth + 'px';
	this.emptyBatteryElement.style.height = '0px';
 
	var emptyImage = document.createElement('img');
	emptyImage.src = emptyBatterySrc;
 
	this.emptyBatteryElement.appendChild(emptyImage);
 
	el.appendChild(fullImage);
	el.appendChild(this.emptyBatteryElement);
 
	this.domElement = el;
}

Battery.prototype.appendTo = function(parentElement)
{
	parentElement.appendChild(this.domElement);
}

/**
 * Updates battery with the given value (0 - 100 range)
 * @param {Number} value
 */
Battery.prototype.updateBattery = function(value)
{
	if(value == undefined || value < 0)
		value = 0;
 
	var height = Math.round(((100 - value) * this.batteryHeight) / 100);
 
	this.emptyBatteryElement.style.height = height + 'px';
}