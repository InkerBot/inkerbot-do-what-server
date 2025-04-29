// 导入基础依赖
import 'lit';
import 'lit-html';
import 'lit-element';
import '@lit/reactive-element';
import 'tslib';

// 导入 Material Web 组件
import '@material/web/all';

// 导入字体
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/material-icons';

// 导入样式
import './style.css';

interface DeviceData {
  device: string;
  online: boolean;
  battery: number;
  activity?: string;
  allWindows: string[];
}

document.addEventListener('DOMContentLoaded', () => {
  // App state
  const devicesOpened = new Set<string>();
  let lastUpdated: Date | null = null;
  let isLoading = true;

  // Get DOM elements
  const devicesContainer = document.getElementById('devices-container')!;
  const loadingIndicator = document.getElementById('loading-indicator')!;
  const errorMessage = document.getElementById('error-message')!;
  const retryButton = document.getElementById('retry-button')!;
  const lastUpdatedSpan = document.getElementById('last-updated')!;
  const themeToggle = document.getElementById('theme-toggle')!;

  // Theme toggling
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icon
    const icon = themeToggle.querySelector('.material-icons')!;
    icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
  });

  // Initialize theme icon
  const icon = themeToggle.querySelector('.material-icons')!;
  icon.textContent = document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'light_mode'
    : 'dark_mode';

  // Fetch device data
  const fetchDevicesData = async () => {
    try {
      // Show loading on first load only
      if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
      }

      const response = await fetch('/cgi-bin/all');

      if (!response.ok) {
        // Throw error to be caught below
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const devicesData = await response.json() as DeviceData[];

      // Update last updated time on success
      lastUpdated = new Date();
      lastUpdatedSpan.textContent = formatTime(lastUpdated); // Ensure success clears any previous error state in footer

      // Hide loading and error states on success
      loadingIndicator.classList.add('hidden');
      errorMessage.classList.add('hidden');
      isLoading = false; // Mark initial load as complete

      // Render devices
      renderDevices(devicesData);

    } catch (error) {
      console.error('Failed to fetch devices data:', error);

      // Only show the full error message if the initial load failed
      if (isLoading) {
        loadingIndicator.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        // Keep isLoading true until the first successful load
      } else {
        // For subsequent errors (background updates), log it and update the footer
        console.warn('Failed to update device data, showing stale data.');
        // Update the footer to indicate the update failure, keeping the last successful time
        if (lastUpdated) {
          lastUpdatedSpan.textContent = `${formatTime(lastUpdated)} (更新失败)`;
          lastUpdatedSpan.style.color = 'var(--md-sys-color-error)'; // Optional: Make it red
        } else {
          // Fallback if lastUpdated is somehow null
           lastUpdatedSpan.textContent = `更新失败`;
           lastUpdatedSpan.style.color = 'var(--md-sys-color-error)';
        }
        // Do NOT hide existing devices or show the main error message
      }
    }
  };

  // Retry button handler
  retryButton.addEventListener('click', fetchDevicesData);

  // Format time as HH:MM:SS
  const formatTime = (date: Date): string => {
    // Reset footer color on successful format (implies successful fetch)
    lastUpdatedSpan.style.color = ''; // Reset color to default
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Render devices to DOM
  const renderDevices = (devicesData: DeviceData[]) => {
    // 强制确保错误消息隐藏（添加到渲染函数开始）
    errorMessage.classList.add('hidden');
    errorMessage.style.display = 'none'; // 增加强制隐藏

    // Store scroll position
    const scrollY = window.scrollY;

    // Create document fragment
    const fragment = document.createDocumentFragment();

    // Check for no devices
    if (!devicesData || devicesData.length === 0) {
      const noDevices = document.createElement('div');
      noDevices.classList.add('empty-state');
      noDevices.innerHTML = `
        <span class="material-icons">devices_off</span>
        <p>没有找到任何设备</p>
      `;
      fragment.appendChild(noDevices);
    } else {
      // Render each device
      devicesData.forEach(device => renderDeviceCard(device, fragment));
    }

    // Update DOM
    devicesContainer!.innerHTML = '';
    devicesContainer!.appendChild(fragment);

    // 强制再次确保错误消息隐藏（添加到渲染函数末尾）
    setTimeout(() => {
      errorMessage.classList.add('hidden');
      errorMessage.style.display = 'none';
    }, 0);

    // Restore scroll position
    window.scrollTo(0, scrollY);
  };

  // Render a single device card
  const renderDeviceCard = (device: DeviceData, container: DocumentFragment) => {
    const isExpanded = devicesOpened.has(device.device);

    // Create card
    const card = document.createElement('div');
    card.classList.add('device-card');

    // Card header
    const header = document.createElement('div');
    header.classList.add('device-header');

    // Device title with icon
    const title = document.createElement('div');
    title.classList.add('device-title');

    // 使用Material Icons
    const deviceIcon = document.createElement('span');
    deviceIcon.className = 'material-icons';
    // 为不同设备选择适合的图标
    deviceIcon.textContent = device.device.toLowerCase().includes('phone') ? 'smartphone' : 'laptop_mac';
    title.appendChild(deviceIcon);

    const deviceName = document.createElement('span');
    deviceName.textContent = device.device;
    title.appendChild(deviceName);

    header.appendChild(title);

    // Status indicator with correct styling
    const status = document.createElement('div');
    status.classList.add('device-status');

    const statusIndicator = document.createElement('div');
    statusIndicator.classList.add('status-indicator');
    statusIndicator.classList.add(device.online ? 'online' : 'offline');

    const statusIcon = document.createElement('span');
    statusIcon.className = 'material-icons';
    statusIcon.textContent = device.online ? 'wifi' : 'wifi_off';
    statusIndicator.appendChild(statusIcon);

    const statusText = document.createElement('span');
    statusText.textContent = device.online ? '在线' : '离线';
    statusIndicator.appendChild(statusText);

    status.appendChild(statusIndicator);
    header.appendChild(status);
    card.appendChild(header);

    // Card body
    const body = document.createElement('div');
    body.classList.add('device-body');

    // Current activity with icon
    if (device.activity) {
      const activity = document.createElement('div');
      activity.classList.add('device-activity');

      const activityIcon = document.createElement('span');
      activityIcon.className = 'material-icons';
      activityIcon.textContent = getActivityIcon(device.activity);
      activity.appendChild(activityIcon);

      const activityText = document.createElement('span');
      activityText.innerHTML = `<strong>当前活动:</strong> ${device.activity}`;
      activity.appendChild(activityText);

      body.appendChild(activity);
    }

    // Battery display with dynamic styling
    if (device.battery !== -1) {
      const batteryDisplay = document.createElement('div');
      batteryDisplay.classList.add('battery-display');

      // Battery icon based on level
      const batteryIcon = document.createElement('div');
      batteryIcon.classList.add('battery-icon');
      if (device.battery < 20) {
        batteryIcon.style.backgroundColor = 'var(--md-sys-color-error-container)';
        batteryIcon.style.color = 'var(--md-sys-color-on-error-container)';
      }

      const batteryIconInner = document.createElement('span');
      batteryIconInner.className = 'material-icons';
      batteryIconInner.textContent = getBatteryIcon(device.battery);
      batteryIcon.appendChild(batteryIconInner);

      batteryDisplay.appendChild(batteryIcon);

      // Battery info
      const batteryInfo = document.createElement('div');
      batteryInfo.classList.add('battery-info');

      const batteryLevel = document.createElement('div');
      batteryLevel.classList.add('battery-level');

      const batteryLabel = document.createElement('span');
      batteryLabel.textContent = '电池电量';
      batteryLevel.appendChild(batteryLabel);

      const batteryValue = document.createElement('strong');
      if (device.battery < 20) {
        batteryValue.style.color = 'var(--md-sys-color-error)';
      }
      batteryValue.textContent = `${device.battery}%`;
      batteryLevel.appendChild(batteryValue);

      batteryInfo.appendChild(batteryLevel);

      // Battery progress
      const batteryProgress = document.createElement('md-linear-progress');
      // Replace direct property assignment with setAttribute
      batteryProgress.setAttribute('value', (device.battery / 100).toString());
      if (device.battery < 20) {
        batteryProgress.style.setProperty('--md-linear-progress-active-indicator-color', 'var(--md-sys-color-error)');
      }

      batteryInfo.appendChild(batteryProgress);
      batteryDisplay.appendChild(batteryInfo);
      body.appendChild(batteryDisplay);
    }

    // Windows section
    if (device.allWindows && device.allWindows.length > 0) {
      // Window count title
      const windowCountTitle = document.createElement('div');
      windowCountTitle.classList.add('window-count-title');

      const windowCountIcon = document.createElement('span');
      windowCountIcon.className = 'material-icons';
      windowCountIcon.textContent = 'tab';
      windowCountTitle.appendChild(windowCountIcon);

      const windowCountText = document.createElement('span');
      windowCountText.textContent = `窗口活动`;
      windowCountTitle.appendChild(windowCountText);

      const windowCount = document.createElement('div');
      windowCount.classList.add('window-count-badge');

      if (device.allWindows.length > 10) {
        windowCount.classList.add('lots');
      } else if (device.allWindows.length > 5) {
        windowCount.classList.add('many');
      }

      windowCount.textContent = device.allWindows.length.toString();
      windowCountTitle.appendChild(windowCount);

      body.appendChild(windowCountTitle);

      // Expand button area
      const expandArea = document.createElement('div');
      expandArea.classList.add('expand-area');

      const expandButtonContainer = document.createElement('div');
      expandButtonContainer.classList.add('expand-button-container');

      const expandButton = document.createElement('md-icon-button');
      expandButton.classList.add('expand-button');
      if (isExpanded) expandButton.classList.add('expanded');

      const expandMoreIcon = document.createElement('span');
      expandMoreIcon.className = 'material-icons expand-more';
      expandMoreIcon.textContent = 'expand_more';
      expandButton.appendChild(expandMoreIcon);

      const expandLessIcon = document.createElement('span');
      expandLessIcon.className = 'material-icons expand-less';
      expandLessIcon.textContent = 'expand_less';
      expandButton.appendChild(expandLessIcon);

      const rippleContainer = document.createElement('div');
      rippleContainer.className = 'ripple-container';
      expandButton.appendChild(rippleContainer);

      expandButtonContainer.appendChild(expandButton);
      expandArea.appendChild(expandButtonContainer);
      body.appendChild(expandArea);

      // Details section
      const details = document.createElement('div');
      details.classList.add('device-details');
      if (isExpanded) details.classList.add('expanded');

      const detailsTitle = document.createElement('div');
      detailsTitle.classList.add('details-title');

      const detailsIcon = document.createElement('span');
      detailsIcon.className = 'material-icons';
      detailsIcon.textContent = 'apps';
      detailsTitle.appendChild(detailsIcon);

      const detailsText = document.createElement('span');
      detailsText.textContent = `所有活动窗口 (${device.allWindows.length})`;
      detailsTitle.appendChild(detailsText);

      details.appendChild(detailsTitle);

      const windowList = document.createElement('ul');
      windowList.classList.add('window-list');

      device.allWindows.forEach((window, index) => {
        const windowItem = document.createElement('li');
        windowItem.classList.add('window-item');

        const windowIcon = document.createElement('span');
        windowIcon.className = 'material-icons';
        windowIcon.textContent = getWindowIcon(window);
        windowItem.appendChild(windowIcon);

        const windowText = document.createElement('span');
        windowText.textContent = window;
        windowItem.appendChild(windowText);

        const windowNumber = document.createElement('span');
        windowNumber.classList.add('window-number');
        windowNumber.textContent = (index + 1).toString();
        windowItem.appendChild(windowNumber);

        windowList.appendChild(windowItem);
      });

      details.appendChild(windowList);
      body.appendChild(details);

      // Expand/collapse logic
      const toggleDetails = (e?: MouseEvent) => {
        if (e) {
          // Create ripple effect
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          const rect = expandButton.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;

          rippleContainer.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 600);
        }

        const isCurrentlyOpen = devicesOpened.has(device.device);

        if (isCurrentlyOpen) {
          devicesOpened.delete(device.device);
          details.classList.remove('expanded');
          expandButton.classList.remove('expanded');
        } else {
          devicesOpened.add(device.device);
          details.classList.add('expanded');
          expandButton.classList.add('expanded');
        }
      };

      expandButton.addEventListener('click', toggleDetails);
      windowCountTitle.addEventListener('click', () => toggleDetails());
    }

    card.appendChild(body);
    container.appendChild(card);
  };

  // 根据活动名称获取合适的图标
  const getActivityIcon = (activity: string): string => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('chrome') || lowerActivity.includes('browser')) return 'language';
    if (lowerActivity.includes('youtube')) return 'smart_display';
    if (lowerActivity.includes('bilibili')) return 'slideshow';
    if (lowerActivity.includes('game')) return 'sports_esports';
    if (lowerActivity.includes('music') || lowerActivity.includes('spotify')) return 'music_note';
    if (lowerActivity.includes('video') || lowerActivity.includes('movie')) return 'movie';
    if (lowerActivity.includes('camera')) return 'photo_camera';
    if (lowerActivity.includes('setting')) return 'settings';
    if (lowerActivity.includes('message')) return 'message';
    if (lowerActivity.includes('call')) return 'call';
    return 'app_shortcut';
  };

  // 根据窗口名称获取合适的图标
  const getWindowIcon = (window: string): string => {
    const lowerWindow = window.toLowerCase();
    if (lowerWindow.includes('chrome') || lowerWindow.includes('edge') || lowerWindow.includes('browser')) return 'language';
    if (lowerWindow.includes('file')) return 'folder';
    if (lowerWindow.includes('setting')) return 'settings';
    if (lowerWindow.includes('youtube')) return 'smart_display';
    if (lowerWindow.includes('bilibili')) return 'slideshow';
    if (lowerWindow.includes('game')) return 'sports_esports';
    if (lowerWindow.includes('music') || lowerWindow.includes('spotify')) return 'music_note';
    if (lowerWindow.includes('video') || lowerWindow.includes('movie')) return 'movie';
    if (lowerWindow.includes('camera')) return 'photo_camera';
    if (lowerWindow.includes('message')) return 'message';
    if (lowerWindow.includes('call')) return 'call';
    if (lowerWindow.includes('word') || lowerWindow.includes('doc')) return 'description';
    if (lowerWindow.includes('excel') || lowerWindow.includes('sheet')) return 'table_chart';
    if (lowerWindow.includes('ppt') || lowerWindow.includes('presentation')) return 'slideshow';
    return 'tab';
  };

  // Get appropriate battery icon based on level
  const getBatteryIcon = (level: number): string => {
    if (level >= 90) return 'battery_full';
    if (level >= 75) return 'battery_6_bar';
    if (level >= 60) return 'battery_5_bar';
    if (level >= 45) return 'battery_4_bar';
    if (level >= 30) return 'battery_3_bar';
    if (level >= 15) return 'battery_2_bar';
    if (level >= 5) return 'battery_1_bar';
    return 'battery_alert';
  };

  // 强化hidden类的CSS定义
  const injectCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
      .hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  };

  // 执行注入
  injectCSS();

  // Initial fetch
  fetchDevicesData();

  // Set up polling with better timing
  setInterval(fetchDevicesData, 10000);
});
