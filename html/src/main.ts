import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const devicesOpened = new Set<string>();
  const devicesContainer = document.getElementById('devices');

  const fetchDevicesData = async () => {
    try {
      const response = await fetch('/cgi-bin/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const devicesData = await response.json();
      renderDevices(devicesData);
    } catch (error) {
      console.error('Failed to fetch devices data:', error);
      devicesContainer!.textContent = 'Failed to load device data.';
    }
  };

  const renderDevices = (devicesData: any[]) => {
    // 清空 devicesContainer 的内容
    devicesContainer!.innerHTML = '';

    devicesData.forEach(entry => {
      const deviceDiv = document.createElement('div');
      deviceDiv.classList.add('device');

      const nameHeading = document.createElement('h3');
      nameHeading.textContent = entry.device;
      deviceDiv.appendChild(nameHeading);

      const statusParagraph = document.createElement('p');
      const statusSpan = document.createElement('span');
      statusSpan.textContent = entry.online ? '在线' : '离线';
      statusSpan.classList.add(entry.online ? 'online' : 'offline');
      statusParagraph.textContent = '状态: ';
      statusParagraph.appendChild(statusSpan);
      deviceDiv.appendChild(statusParagraph);

      // 添加电池电量显示
      if (entry.battery != -1) {
        const batteryDiv = document.createElement('div');
        batteryDiv.classList.add('battery-container');
  
        const batteryIcon = document.createElement('span');
        batteryIcon.classList.add('battery-icon');
        batteryIcon.style.width = `${entry.battery}%`; // 设置电池宽度
  
        // 创建电量数值显示
        const batteryValue = document.createElement('span');
        batteryValue.classList.add('battery-value');
        batteryValue.textContent = `${entry.battery}%`;
  
        batteryDiv.appendChild(batteryIcon);
        batteryDiv.appendChild(batteryValue); // 将数值添加到容器中
        deviceDiv.appendChild(batteryDiv);
      }

      if (entry.activity) {
        const activityParagraph = document.createElement('p');
        activityParagraph.textContent = `${entry.activity}`;
        deviceDiv.appendChild(activityParagraph);
      }

      const deviceDetails = document.createElement('div');
      deviceDetails.classList.add('device-details');
      entry.allWindows.forEach((activity: any) => {
        const activityParagraph = document.createElement('p');
        activityParagraph.textContent = `${activity}`;
        deviceDetails.appendChild(activityParagraph);
      });
      deviceDiv.onclick = () => {
        console.log('Clicked on device:', entry.device);
        const isOpened = devicesOpened.has(entry.device);
        if (isOpened) {
          devicesOpened.delete(entry.device);
          deviceDetails.classList.add('invisible');
        } else {
          devicesOpened.add(entry.device);
          deviceDetails.classList.remove('invisible');
        }
      }
      if (!devicesOpened.has(entry.device)) {
        deviceDetails.classList.add('invisible');
      }
      deviceDiv.appendChild(deviceDetails);

      devicesContainer?.appendChild(deviceDiv);
    });
  };

  fetchDevicesData();
  setInterval(fetchDevicesData, 10000);
});

