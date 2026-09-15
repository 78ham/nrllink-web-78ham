<template>
  <div
    class="ham-chat-wrapper"
    :class="[isDarkMode ? 'dark-mode' : 'light-mode', { 'drawer-open': showSettingsDrawer }]"
    :style="wrapperDynamicStyle"
  >
    <!-- Background ambiance glow layer (zero blur lag, hardware-accelerated) -->
    <div class="ham-ambiance-backdrop" :style="backdropDynamicStyle" />

    <!-- Top Navigation Bar -->
    <header class="ham-topbar">
      <div class="topbar-left">
        <div class="app-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
            </svg>
          </div>
          <span class="brand-title">HAM <span class="brand-subtitle">互联对讲</span></span>
          <span class="brand-tag">NRL系统</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Live Connection Status Pill -->
        <div class="connection-status-pill" :class="wsStatusClass" :title="wsStatusText">
          <span class="status-dot" />
          <span class="status-label">{{ wsStatusText }}</span>
        </div>

        <!-- Audio mute toggle -->
        <button
          type="button"
          class="topbar-btn audio-toggle-btn"
          :class="{ 'is-muted': isAudioMuted }"
          :title="isAudioMuted ? '取消静音' : '对讲静音'"
          @click="toggleAudioMute"
        >
          <svg v-if="!isAudioMuted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        </button>

        <!-- Dark / Light Theme Toggle -->
        <button
          type="button"
          class="topbar-btn theme-toggle-btn"
          :title="isDarkMode ? '切换到日间明亮' : '切换到夜间深色'"
          @click="toggleDarkMode"
        >
          <svg v-if="!isDarkMode" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12.3 2a10 10 0 0 0 9.7 13.7 10 10 0 1 1-9.7-13.7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        <!-- User Profile Avatar -->
        <div class="user-avatar-badge" :title="userTooltip">
          <img v-if="userAvatarUrl" :src="userAvatarUrl" class="avatar-img" alt="avatar" />
          <span v-else class="avatar-letter">{{ userInitial }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content Grid -->
    <div class="ham-layout-body">
      <!-- Left Sidebar: Contacts & Rooms -->
      <aside class="ham-sidebar-card">
        <div class="sidebar-header">
          <div class="sidebar-title-row">
            <span class="title-text">联系人</span>
            <span class="count-badge">{{ activeTabItemCount }}</span>
          </div>
          <button type="button" class="icon-action-btn" title="快捷新建或加群" @click="handleOpenQuickDialog">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="sidebar-search-container">
          <div class="search-input-pill">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索联系人或群聊"
            />
            <button v-if="searchQuery" type="button" class="clear-search-btn" @click="searchQuery = ''">
              ✕
            </button>
          </div>
        </div>

        <!-- Segmented Tab Pills -->
        <div class="sidebar-tabs-row">
          <button
            type="button"
            class="tab-pill-btn"
            :class="{ active: currentTab === 'all' }"
            @click="currentTab = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            class="tab-pill-btn"
            :class="{ active: currentTab === 'friends' }"
            @click="currentTab = 'friends'"
          >
            好友
          </button>
          <button
            type="button"
            class="tab-pill-btn"
            :class="{ active: currentTab === 'groups' }"
            @click="currentTab = 'groups'"
          >
            群聊
          </button>
        </div>

        <!-- Contact / Room Item List -->
        <div class="sidebar-item-scroll-area">
          <div v-if="filteredItems.length === 0" class="empty-contacts-view">
            <div class="empty-icon-circle">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="empty-text">暂无联系人</div>
            <div class="empty-actions-col">
              <button type="button" class="empty-link-btn" @click="handleOpenQuickDialog">添加好友</button>
              <button type="button" class="empty-link-btn" @click="handleOpenQuickDialog">创建群聊</button>
            </div>
          </div>

          <div v-else class="items-list-container">
            <div
              v-for="item in filteredItems"
              :key="item.id || item.room_key"
              class="contact-room-item"
              :class="{
                'is-active': selectedTarget && selectedTarget.room_key === item.room_key,
                'is-speaking': item.active
              }"
              @click="selectTarget(item)"
            >
              <div class="item-avatar-col">
                <div class="avatar-circle" :style="{ background: item.avatarBg || 'var(--ham-accent)' }">
                  <span v-if="item.isRoom" class="avatar-room-hash">#</span>
                  <span v-else class="avatar-initial">{{ (item.title || 'U')[0] }}</span>
                </div>
                <span v-if="item.active" class="item-speaking-pulse-dot" />
              </div>

              <div class="item-meta-col">
                <div class="item-top-row">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-time">{{ item.time || '刚刚' }}</span>
                </div>
                <div class="item-bottom-row">
                  <span v-if="item.active && item.caller" class="item-caller-badge">
                    <span class="voice-wave-mini">
                      <span /><span /><span />
                    </span>
                    {{ item.caller }}
                  </span>
                  <span v-else class="item-preview-text">{{ item.subtitle || (item.isRoom ? '空闲中' : '离线') }}</span>

                  <button
                    v-if="item.isRoom"
                    type="button"
                    class="sub-audio-icon-btn"
                    :class="{ 'is-subscribed': subscribedRoomKeys.includes(item.room_key) }"
                    :title="subscribedRoomKeys.includes(item.room_key) ? '点击取消订阅音频' : '点击监听对讲音频'"
                    @click.stop="toggleRoomAudioSubscription(item.room_key)"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Footer Action Bar -->
        <div class="sidebar-footer-bar">
          <div class="footer-action-buttons">
            <button type="button" class="footer-sub-btn" @click="handleOpenQuickDialog">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span>好友管理</span>
            </button>
            <button type="button" class="footer-sub-btn" @click="handleOpenQuickDialog">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>建群</span>
            </button>
          </div>

          <div class="footer-user-strip">
            <div class="footer-user-info">
              <div class="mini-user-avatar">{{ userInitial }}</div>
              <span class="user-display-name">{{ userCallsign || 'HAM Operator' }}</span>
            </div>
            <button
              type="button"
              class="settings-gear-btn"
              :class="{ 'is-active': showSettingsDrawer }"
              title="个性化与外观设置"
              @click="toggleSettingsDrawer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Center Main Chat / Stream Card -->
      <main class="ham-chat-card">
        <!-- Chat Header -->
        <header class="chat-main-header">
          <div class="chat-header-info">
            <h2 class="target-title">{{ selectedTargetTitle }}</h2>
            <div class="target-status-row">
              <span v-if="selectedTarget && selectedTarget.isRoom" class="room-status-badge" :class="{ 'is-speaking': isSelectedRoomSpeaking }">
                <span class="live-dot" />
                {{ isSelectedRoomSpeaking ? `正在通联 · ${selectedTarget.caller || '通话中'}` : '频道就绪 · 待命' }}
              </span>
              <span v-else class="friend-status-badge">● 在线</span>
              <span class="member-tag">{{ memberTagText }}</span>
            </div>
          </div>

          <div class="chat-header-actions">
            <!-- Intercom PTT Mode Button -->
            <button
              type="button"
              class="header-tool-btn"
              :class="{ 'is-ptt-active': isPttActive }"
              :title="isPttActive ? '松开发射' : '按住发起对讲'"
              @mousedown="startPttTransmit"
              @mouseup="stopPttTransmit"
              @mouseleave="stopPttTransmit"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span>{{ isPttActive ? '发射中...' : 'PTT对讲' }}</span>
            </button>

            <!-- Three Dots Action Menu -->
            <el-dropdown trigger="click">
              <button type="button" class="header-tool-btn icon-only" title="更多选项">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <circle cx="5" cy="12" r="2" />
                </svg>
              </button>
              <template #dropdown>
                <el-dropdown-menu class="ham-dropdown-menu">
                  <el-dropdown-item @click="toggleSettingsDrawer">外观与个性化设置</el-dropdown-item>
                  <el-dropdown-item @click="clearMessages">清空当前会话记录</el-dropdown-item>
                  <el-dropdown-item divided @click="exportChatHistory">导出聊天与通话记录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </header>

        <!-- Message Feed Container -->
        <div ref="messageContainerRef" class="chat-message-feed">
          <!-- Room Greeting / System Card -->
          <div class="system-welcome-card">
            <div class="welcome-icon">📻</div>
            <div class="welcome-text">
              <strong>{{ selectedTargetTitle }}</strong> 已建立安全无线电互联连接。
              支持语音通联回放、文字消息直传与实时双向对讲。
            </div>
          </div>

          <!-- Message Bubbles Stream -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="{ 'is-me': msg.isMe, 'is-system': msg.isSystem, 'is-voice': msg.isVoice }"
          >
            <!-- System message -->
            <div v-if="msg.isSystem" class="system-pill-bubble">
              <span>{{ msg.content }}</span>
            </div>

            <!-- User or Intercom message -->
            <template v-else>
              <div class="message-avatar">
                <span class="avatar-letter">{{ (msg.sender || 'H')[0] }}</span>
              </div>

              <div class="message-body-wrap">
                <div class="message-meta-row">
                  <span class="sender-callsign">{{ msg.sender }}</span>
                  <span v-if="msg.ssid" class="sender-ssid">-{{ msg.ssid }}</span>
                  <time class="message-timestamp">{{ msg.time }}</time>
                </div>

                <!-- Voice / Radio Call Message Card -->
                <div v-if="msg.isVoice" class="voice-bubble-card" @click="playVoiceSnippet(msg)">
                  <div class="voice-play-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div class="voice-waveform-strip">
                    <span v-for="h in msg.waveHeights || [6, 14, 20, 10, 18, 12, 8, 16, 22, 14, 8]" :key="h" :style="{ height: `${h}px` }" />
                  </div>
                  <span class="voice-duration">{{ msg.durationText || '00:04' }}</span>
                </div>

                <!-- Text Bubble -->
                <div v-else class="text-bubble" :class="bubbleStyleClass">
                  <span class="bubble-text">{{ msg.content }}</span>

                  <!-- Context action popup button on hover -->
                  <div class="bubble-hover-actions">
                    <button type="button" class="bubble-action-btn" title="复制消息" @click.stop="copyMessageContent(msg.content)">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>复制</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Floating Input Container -->
        <footer class="floating-input-card">
          <div class="input-top-area">
            <textarea
              ref="inputRef"
              v-model="inputContent"
              class="message-textarea"
              placeholder="输入消息..."
              rows="1"
              @keydown.enter.exact.prevent="handleSendMessage"
              @input="autoGrowTextarea"
            />
          </div>

          <div class="input-bottom-actions-row">
            <div class="input-tools-left">
              <!-- Attachment Button -->
              <button type="button" class="tool-circle-btn" title="发送附件" @click="handleAttachmentClick">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input ref="fileInputRef" type="file" style="display: none" @change="handleFileSelected" />

              <span class="send-shortcut-hint">Enter 发送 · Shift + Enter 换行</span>
            </div>

            <!-- Send Button with round green circle & up arrow -->
            <button
              type="button"
              class="circular-send-btn"
              :class="{ 'can-send': inputContent.trim().length > 0 }"
              title="发送消息 (Enter)"
              @click="handleSendMessage"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </footer>
      </main>

      <!-- Right Drawer: Appearance & Customization -->
      <aside v-if="showSettingsDrawer" class="ham-settings-drawer">
        <div class="drawer-header">
          <div class="drawer-header-titles">
            <h3 class="drawer-title">个性化与外观</h3>
            <span class="drawer-subtitle">实时氛围渲染</span>
          </div>
          <button type="button" class="close-drawer-btn" title="关闭" @click="showSettingsDrawer = false">
            ✕
          </button>
        </div>

        <!-- Tabs: 外观, 气泡, 账号 -->
        <div class="drawer-tabs-row">
          <button
            type="button"
            class="drawer-tab-btn"
            :class="{ active: drawerActiveTab === 'appearance' }"
            @click="drawerActiveTab = 'appearance'"
          >
            <span class="tab-icon">🎨</span>
            外观
          </button>
          <button
            type="button"
            class="drawer-tab-btn"
            :class="{ active: drawerActiveTab === 'bubbles' }"
            @click="drawerActiveTab = 'bubbles'"
          >
            <span class="tab-icon">💬</span>
            气泡
          </button>
          <button
            type="button"
            class="drawer-tab-btn"
            :class="{ active: drawerActiveTab === 'account' }"
            @click="drawerActiveTab = 'account'"
          >
            <span class="tab-icon">👤</span>
            账号
          </button>
        </div>

        <!-- Tab 1: 外观 (Appearance) -->
        <div v-if="drawerActiveTab === 'appearance'" class="drawer-content-scroll">
          <!-- 背景氛围 Section -->
          <div class="settings-section">
            <div class="section-title-row">
              <span class="section-badge-icon">✨</span>
              <span class="section-title">背景氛围</span>
            </div>

            <!-- Slider 1: 背景模糊 -->
            <div class="slider-control-group">
              <div class="slider-header-row">
                <span class="slider-label">背景模糊</span>
                <span class="slider-value-display">{{ appearance.bgBlur }} px</span>
              </div>
              <input
                v-model.number="appearance.bgBlur"
                type="range"
                min="0"
                max="28"
                step="1"
                class="ham-range-slider"
                @input="handleAppearanceChange"
              />
            </div>

            <!-- Slider 2: 背景压缩 -->
            <div class="slider-control-group">
              <div class="slider-header-row">
                <span class="slider-label">背景压缩</span>
                <span class="slider-value-display">{{ appearance.bgCompression }} %</span>
              </div>
              <input
                v-model.number="appearance.bgCompression"
                type="range"
                min="0"
                max="80"
                step="5"
                class="ham-range-slider"
                @input="handleAppearanceChange"
              />
            </div>
          </div>

          <!-- 主题色系 Section -->
          <div class="settings-section">
            <div class="section-title-row">
              <span class="section-badge-icon">🌿</span>
              <span class="section-title">主题色系</span>
            </div>

            <div class="color-palette-grid">
              <button
                v-for="color in themePresets"
                :key="color.key"
                type="button"
                class="color-palette-item"
                :class="{ 'is-selected': appearance.currentThemeColor === color.key }"
                :style="{ background: color.primary }"
                :title="color.name"
                @click="selectThemePreset(color)"
              >
                <span v-if="appearance.currentThemeColor === color.key" class="color-check-mark">✓</span>
              </button>
            </div>
            <div class="selected-theme-name">{{ currentThemeName }}</div>
          </div>

          <!-- 卡片圆角 Section -->
          <div class="settings-section">
            <div class="section-title-row">
              <span class="section-badge-icon">📐</span>
              <span class="section-title">卡片圆角风格</span>
            </div>

            <div class="segmented-option-row">
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: appearance.borderRadius === '16px' }"
                @click="setCardRadius('16px')"
              >
                精炼 (16px)
              </button>
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: appearance.borderRadius === '22px' }"
                @click="setCardRadius('22px')"
              >
                经典 (22px)
              </button>
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: appearance.borderRadius === '28px' }"
                @click="setCardRadius('28px')"
              >
                圆润 (28px)
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 2: 气泡 (Bubbles) -->
        <div v-else-if="drawerActiveTab === 'bubbles'" class="drawer-content-scroll">
          <div class="settings-section">
            <div class="section-title-row">
              <span class="section-badge-icon">💬</span>
              <span class="section-title">气泡风格</span>
            </div>

            <div class="bubble-preview-card" :class="bubbleStyleClass">
              <div class="preview-text">这是一条预览消息，体现当前气泡的圆角与光影质感。</div>
            </div>

            <div class="segmented-option-row">
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: bubbleStyle === 'soft' }"
                @click="bubbleStyle = 'soft'"
              >
                柔和圆角
              </button>
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: bubbleStyle === 'minimal' }"
                @click="bubbleStyle = 'minimal'"
              >
                极简悬浮
              </button>
              <button
                type="button"
                class="seg-option-btn"
                :class="{ active: bubbleStyle === 'classic' }"
                @click="bubbleStyle = 'classic'"
              >
                微信质感
              </button>
            </div>
          </div>
        </div>

        <!-- Tab 3: 账号 (Account) -->
        <div v-else class="drawer-content-scroll">
          <div class="settings-section">
            <div class="section-title-row">
              <span class="section-badge-icon">📻</span>
              <span class="section-title">通联身份</span>
            </div>

            <div class="account-info-box">
              <div class="info-row">
                <span class="info-label">我的呼号:</span>
                <strong class="info-val">{{ userCallsign || '未登录' }}</strong>
              </div>
              <div class="info-row">
                <span class="info-label">SSID:</span>
                <span class="info-val">1 (互联终端)</span>
              </div>
              <div class="info-row">
                <span class="info-label">音频解码:</span>
                <span class="info-val">G.711 A-law 8kHz</span>
              </div>
              <div class="info-row">
                <span class="info-label">Web Worker:</span>
                <span class="info-val green-text">独立线程零卡顿已启用</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Quick Add Dialog -->
    <el-dialog
      v-model="quickDialogVisible"
      title="快捷管理 · HAM互联房间"
      width="440px"
      append-to-body
      custom-class="ham-modal"
    >
      <div class="quick-modal-content">
        <el-form label-position="top">
          <el-form-item label="房间号或呼号">
            <el-input v-model="quickInputVal" placeholder="例如: 1000 或 BH4RPN" clearable />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="modal-footer-btns">
          <el-button @click="quickDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleQuickSubmit">确定进入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

export default {
  name: 'ChatRoom',
  data() {
    return {
      // Search & Navigation
      searchQuery: '',
      currentTab: 'all',
      selectedTarget: null,

      // Appearance & Theme settings
      isDarkMode: false,
      showSettingsDrawer: true,
      drawerActiveTab: 'appearance',
      bubbleStyle: 'soft',
      appearance: {
        bgBlur: 0,
        bgCompression: 0,
        currentThemeColor: 'sage',
        borderRadius: '22px'
      },
      themePresets: [
        { key: 'sage', name: '鼠尾草绿', primary: '#508764', secondary: '#3b6a4a', bgLight: '#edf2eb' },
        { key: 'light', name: '极简明亮', primary: '#2563eb', secondary: '#1d4ed8', bgLight: '#eff6ff' },
        { key: 'dark', name: '深空深色', primary: '#38bdf8', secondary: '#0284c7', bgLight: '#181c19' },
        { key: 'purple', name: '薰衣草紫', primary: '#8b5cf6', secondary: '#6d28d9', bgLight: '#f5f3ff' },
        { key: 'sunset', name: '温暖落日', primary: '#d97706', secondary: '#b45309', bgLight: '#fffbeb' },
        { key: 'forest', name: '翠绿森林', primary: '#059669', secondary: '#047857', bgLight: '#ecfdf5' }
      ],

      // Rooms & Friends state
      rooms: [],
      recentCalls: [],
      subscribedRoomKeys: [],

      // Chat Messages
      inputContent: '',
      messages: [],
      isPttActive: false,
      isAudioMuted: false,

      // WebSocket & Audio
      websock: null,
      wsConnected: false,
      wsRetryTimer: null,
      wsPingTimer: null,
      audioContext: null,
      audioGainNode: null,
      audioWorker: null,
      nextPlayTime: 0,

      // Modals
      quickDialogVisible: false,
      quickInputVal: ''
    }
  },
  computed: {
    ...mapState(useUserStore, ['name', 'callsign', 'avatar']),
    userCallsign() {
      return this.callsign || this.name || 'HAM_78'
    },
    userInitial() {
      const src = this.userCallsign || 'B'
      return src[0].toUpperCase()
    },
    userAvatarUrl() {
      return this.avatar ? `${this.avatar}?imageView2/1/w/80/h/80` : ''
    },
    userTooltip() {
      return `${this.userCallsign} · HAM对讲已就绪`
    },
    wsStatusClass() {
      if (this.wsConnected) return 'is-connected'
      if (this.websock) return 'is-connecting'
      return 'is-disconnected'
    },
    wsStatusText() {
      if (this.wsConnected) return '已连接'
      if (this.websock) return '重连中...'
      return '已断开'
    },
    currentThemeObj() {
      return this.themePresets.find(t => t.key === this.appearance.currentThemeColor) || this.themePresets[0]
    },
    currentThemeName() {
      return this.currentThemeObj.name
    },
    activeTabItemCount() {
      return this.filteredItems.length
    },
    filteredItems() {
      let list = []
      if (this.currentTab === 'all' || this.currentTab === 'groups') {
        const roomItems = this.rooms.map(r => ({
          ...r,
          id: `room-${r.room_key || r.room_id}`,
          isRoom: true,
          title: `#${r.room_id} · ${r.room_name || '群组房间'}`,
          subtitle: r.active ? `${r.caller || '正在通联'}` : '频道空闲',
          caller: r.caller,
          active: !!r.active
        }))
        list = [...list, ...roomItems]
      }

      if (this.currentTab === 'all' || this.currentTab === 'friends') {
        const friendItems = [
          {
            id: 'friend-1',
            isRoom: false,
            title: 'BH4RPN',
            subtitle: '在线 · 438.500MHz 中继',
            active: false,
            avatarBg: '#3b82f6',
            time: '14:20'
          },
          {
            id: 'friend-2',
            isRoom: false,
            title: 'BG4VKI',
            subtitle: '在线 · 准备通联',
            active: false,
            avatarBg: '#10b981',
            time: '11:05'
          }
        ]
        list = [...list, ...friendItems]
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        list = list.filter(item => item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q)))
      }

      return list
    },
    selectedTargetTitle() {
      if (!this.selectedTarget) return '全国HAM通联总群 (#1000)'
      return this.selectedTarget.title || '频道对讲'
    },
    isSelectedRoomSpeaking() {
      return !!(this.selectedTarget && this.selectedTarget.active)
    },
    memberTagText() {
      if (!this.selectedTarget || this.selectedTarget.isRoom) {
        return '成员 28 · 语音就绪'
      }
      return '私聊互通'
    },
    bubbleStyleClass() {
      return `bubble-style--${this.bubbleStyle}`
    },
    wrapperDynamicStyle() {
      const theme = this.currentThemeObj
      return {
        '--ham-accent': theme.primary,
        '--ham-accent-secondary': theme.secondary,
        '--ham-card-radius': this.appearance.borderRadius,
        '--ham-bg-blur': `${this.appearance.bgBlur}px`
      }
    },
    backdropDynamicStyle() {
      const comp = this.appearance.bgCompression / 100
      const blurVal = this.appearance.bgBlur
      return {
        filter: blurVal > 0 ? `blur(${blurVal}px)` : 'none',
        opacity: Math.max(0.2, 1 - comp * 0.7)
      }
    }
  },
  created() {
    this.loadAppearanceSettings()
    this.initDefaultMessages()
    this.initDefaultRooms()
    this.initMonitorWebSocket()
  },
  mounted() {
    this.scrollToBottom()
  },
  beforeUnmount() {
    this.destroyMonitorWebSocket()
  },
  methods: {
    loadAppearanceSettings() {
      try {
        const saved = localStorage.getItem('ham_chat_appearance_cfg')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.appearance = { ...this.appearance, ...parsed }
          if (parsed.isDarkMode !== undefined) {
            this.isDarkMode = parsed.isDarkMode
          }
        }
      } catch (e) {
        // Ignore JSON error
      }
    },
    saveAppearanceSettings() {
      try {
        localStorage.setItem('ham_chat_appearance_cfg', JSON.stringify({
          ...this.appearance,
          isDarkMode: this.isDarkMode
        }))
      } catch (e) {
        // Ignore storage error
      }
    },
    handleAppearanceChange() {
      this.saveAppearanceSettings()
    },
    selectThemePreset(theme) {
      this.appearance.currentThemeColor = theme.key
      this.saveAppearanceSettings()
      ElMessage.success(`已应用 ${theme.name} 配色`)
    },
    setCardRadius(radius) {
      this.appearance.borderRadius = radius
      this.saveAppearanceSettings()
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      this.saveAppearanceSettings()
    },
    toggleSettingsDrawer() {
      this.showSettingsDrawer = !this.showSettingsDrawer
    },
    toggleAudioMute() {
      this.isAudioMuted = !this.isAudioMuted
      if (this.audioGainNode) {
        this.audioGainNode.gain.value = this.isAudioMuted ? 0 : 0.9
      }
      ElMessage.info(this.isAudioMuted ? '已静音对讲音频' : '对讲音频已开启')
    },
    initDefaultRooms() {
      this.rooms = [
        {
          room_key: '1000',
          room_id: '1000',
          room_name: '全国通联总群',
          active: false,
          caller: ''
        },
        {
          room_key: '1001',
          room_id: '1001',
          room_name: '应急通联与演练',
          active: false,
          caller: ''
        },
        {
          room_key: '1008',
          room_id: '1008',
          room_name: '华东区域互联中继',
          active: false,
          caller: ''
        }
      ]
      this.selectedTarget = this.rooms[0]
    },
    initDefaultMessages() {
      this.messages = [
        {
          id: 'msg-1',
          sender: 'BH4RPN',
          ssid: '1',
          time: '14:21',
          content: '73! 各位友台好，测试新版界面的互联音质与流畅度。',
          isMe: false,
          isVoice: false
        },
        {
          id: 'msg-2',
          sender: 'BH4RPN',
          ssid: '1',
          time: '14:22',
          content: '',
          isMe: false,
          isVoice: true,
          durationText: '00:04',
          waveHeights: [8, 14, 22, 16, 24, 18, 10, 15, 20, 12, 6]
        },
        {
          id: 'msg-3',
          sender: this.userCallsign,
          ssid: '1',
          time: '14:23',
          content: '收到信号清晰，59+！UI全面升级现代化卡片设计，操作极度丝滑！',
          isMe: true,
          isVoice: false
        }
      ]
    },
    selectTarget(target) {
      this.selectedTarget = target
      if (target.isRoom && !this.subscribedRoomKeys.includes(target.room_key)) {
        this.toggleRoomAudioSubscription(target.room_key)
      }
    },
    handleSendMessage() {
      const text = this.inputContent.trim()
      if (!text) return

      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: this.userCallsign,
        ssid: '1',
        time: new Date().toTimeString().slice(0, 5),
        content: text,
        isMe: true,
        isVoice: false
      }

      this.messages.push(newMsg)
      this.inputContent = ''

      if (this.$refs.inputRef) {
        this.$refs.inputRef.style.height = 'auto'
      }

      this.scrollToBottom()

      if (this.websock && this.websock.readyState === WebSocket.OPEN) {
        this.websock.send(JSON.stringify({
          action: 'chat_message',
          room_key: this.selectedTarget ? this.selectedTarget.room_key : '1000',
          content: text
        }))
      }
    },
    handleAttachmentClick() {
      if (this.$refs.fileInputRef) {
        this.$refs.fileInputRef.click()
      }
    },
    handleFileSelected(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      ElMessage.success(`已选择附件: ${file.name}`)
      event.target.value = ''
    },
    copyMessageContent(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          ElMessage.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(text)
        })
      } else {
        this.fallbackCopy(text)
      }
    },
    fallbackCopy(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('已复制到剪贴板')
    },
    startPttTransmit() {
      this.isPttActive = true
      ElMessage.warning('PTT 按下：正在发射音频...')
    },
    stopPttTransmit() {
      if (this.isPttActive) {
        this.isPttActive = false
        ElMessage.info('PTT 释放：发射结束')
      }
    },
    clearMessages() {
      this.messages = []
      ElMessage.info('已清空当前消息')
    },
    exportChatHistory() {
      const text = this.messages.map(m => `[${m.time}] ${m.sender}: ${m.content || '(语音消息)'}`).join('\n')
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `HAM_Chat_${Date.now()}.txt`
      link.click()
      URL.revokeObjectURL(url)
      ElMessage.success('聊天记录已导出')
    },
    playVoiceSnippet(msg) {
      ElMessage.info(`播放通联语音 (${msg.durationText || '00:04'})`)
    },
    handleOpenQuickDialog() {
      this.quickInputVal = ''
      this.quickDialogVisible = true
    },
    handleQuickSubmit() {
      const val = this.quickInputVal.trim()
      if (!val) return
      const existing = this.rooms.find(r => r.room_id === val)
      if (existing) {
        this.selectTarget(existing)
      } else {
        const newRoom = {
          room_key: val,
          room_id: val,
          room_name: `快捷房间 #${val}`,
          active: false,
          caller: ''
        }
        this.rooms.push(newRoom)
        this.selectTarget(newRoom)
      }
      this.quickDialogVisible = false
      ElMessage.success(`已切换至 #${val}`)
    },
    autoGrowTextarea() {
      const el = this.$refs.inputRef
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageContainerRef
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },

    // Audio & WebSocket Implementation (High-Performance, Zero-GC lag)
    async ensureAudioReady() {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        this.audioContext = new AudioCtx({ sampleRate: 8000 })
        this.audioGainNode = this.audioContext.createGain()
        this.audioGainNode.gain.value = this.isAudioMuted ? 0 : 0.9
        this.audioGainNode.connect(this.audioContext.destination)
        this.nextPlayTime = this.audioContext.currentTime
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    },
    initAudioWorker() {
      if (this.audioWorker) return
      this.audioWorker = new Worker(new URL('@/workers/alawDecode.worker.js', import.meta.url), {
        type: 'module'
      })
      this.audioWorker.onmessage = (e) => {
        this.playPcmBuffer(e.data.pcm)
      }
    },
    playPcmBuffer(pcm) {
      if (!this.audioContext || !this.audioGainNode || this.isAudioMuted) return

      const buffer = this.audioContext.createBuffer(1, pcm.length, 8000)
      buffer.copyToChannel(pcm, 0)

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioGainNode)

      const now = this.audioContext.currentTime
      if (this.nextPlayTime < now || this.nextPlayTime - now > 1) {
        this.nextPlayTime = now + 0.05
      }

      source.start(this.nextPlayTime)
      this.nextPlayTime += buffer.duration
    },
    playG711Frame(g711Bytes) {
      if (!this.audioContext || !this.audioGainNode) return
      this.initAudioWorker()
      this.audioWorker.postMessage({ g711Bytes })
    },
    buildWsUrl() {
      const baseApi = import.meta.env.VITE_BASE_API || ''
      const token = getToken()
      let baseUrl = baseApi

      if (!baseUrl || baseUrl.startsWith('/')) {
        baseUrl = `${window.location.origin}${baseUrl}`
      }

      baseUrl = baseUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:')
      const url = `${baseUrl.replace(/\/$/, '')}/ws/calls`
      return token ? `${url}?token=${encodeURIComponent(token)}` : url
    },
    initMonitorWebSocket() {
      try {
        const ws = new WebSocket(this.buildWsUrl())
        ws.binaryType = 'arraybuffer'
        ws.onopen = () => {
          this.wsConnected = true
          this.wsPingTimer = window.setInterval(() => {
            if (this.websock && this.websock.readyState === WebSocket.OPEN) {
              this.websock.send(JSON.stringify({ action: 'ping' }))
            }
          }, 10000)
        }
        ws.onmessage = this.handleWsMessage
        ws.onerror = () => {
          this.wsConnected = false
        }
        ws.onclose = () => {
          this.wsConnected = false
          if (this.wsPingTimer) {
            clearInterval(this.wsPingTimer)
            this.wsPingTimer = null
          }
          this.websock = null
        }
        this.websock = ws
      } catch (e) {
        this.wsConnected = false
      }
    },
    destroyMonitorWebSocket() {
      if (this.wsPingTimer) {
        clearInterval(this.wsPingTimer)
        this.wsPingTimer = null
      }
      if (this.websock) {
        try {
          this.websock.close()
        } catch (e) {
          // ignore
        }
        this.websock = null
      }
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }
      if (this.audioWorker) {
        this.audioWorker.terminate()
        this.audioWorker = null
      }
    },
    handleWsMessage(event) {
      if (typeof event.data === 'string') {
        try {
          const payload = JSON.parse(event.data)
          this.handleWsJSON(payload)
        } catch (e) {
          // ignore
        }
        return
      }

      const bytes = new Uint8Array(event.data)
      if (bytes.length > 0) {
        this.playG711Frame(bytes)
      }
    },
    handleWsJSON(payload) {
      if (payload.type === 'snapshot' && Array.isArray(payload.rooms)) {
        this.rooms = payload.rooms
        if (!this.selectedTarget && this.rooms.length > 0) {
          this.selectedTarget = this.rooms[0]
        }
      } else if (payload.type === 'room_state' && payload.room) {
        const idx = this.rooms.findIndex(r => r.room_key === payload.room.room_key)
        if (idx !== -1) {
          this.rooms.splice(idx, 1, { ...this.rooms[idx], ...payload.room })
        }
      }
    },
    async toggleRoomAudioSubscription(roomKey) {
      if (!this.websock || this.websock.readyState !== WebSocket.OPEN) {
        const exists = this.subscribedRoomKeys.includes(roomKey)
        if (exists) {
          this.subscribedRoomKeys = this.subscribedRoomKeys.filter(k => k !== roomKey)
          ElMessage.info('已停止监听该频道音频')
        } else {
          this.subscribedRoomKeys.push(roomKey)
          await this.ensureAudioReady()
          ElMessage.success('已开启监听该频道音频')
        }
        return
      }

      const subscribed = this.subscribedRoomKeys.includes(roomKey)
      if (!subscribed) {
        await this.ensureAudioReady()
      }

      this.websock.send(JSON.stringify({
        action: subscribed ? 'unsubscribe' : 'subscribe',
        room_keys: [roomKey]
      }))

      if (subscribed) {
        this.subscribedRoomKeys = this.subscribedRoomKeys.filter(k => k !== roomKey)
      } else {
        this.subscribedRoomKeys.push(roomKey)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* HAM Chat Layout & Architecture - Silky Smooth 60FPS */
.ham-chat-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
  min-height: 560px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
  background-color: var(--ham-bg, #eef3ed);
  color: var(--ham-text, #1e2821);

  --ham-accent: #508764;
  --ham-accent-secondary: #3b6a4a;
  --ham-card-radius: 22px;
  --ham-bg-blur: 0px;

  &.light-mode {
    --ham-bg: #eef3ed;
    --ham-card-bg: #ffffff;
    --ham-sidebar-bg: #edf2eb;
    --ham-sidebar-hover: rgba(80, 135, 100, 0.08);
    --ham-border: rgba(74, 124, 89, 0.12);
    --ham-border-subtle: rgba(0, 0, 0, 0.05);
    --ham-text: #1b261e;
    --ham-text-dim: rgba(27, 38, 30, 0.65);
    --ham-input-bg: #ffffff;
    --ham-bubble-other: #f4f6f3;
    --ham-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  }

  &.dark-mode {
    --ham-bg: #141815;
    --ham-card-bg: #1e2420;
    --ham-sidebar-bg: #181d19;
    --ham-sidebar-hover: rgba(255, 255, 255, 0.05);
    --ham-border: rgba(255, 255, 255, 0.08);
    --ham-border-subtle: rgba(255, 255, 255, 0.04);
    --ham-text: #ecf3ed;
    --ham-text-dim: rgba(236, 243, 237, 0.65);
    --ham-input-bg: #222924;
    --ham-bubble-other: #27302a;
    --ham-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  }
}

/* Zero-lag GPU backdrop */
.ham-ambiance-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 15% 15%, var(--ham-accent) 0%, transparent 60%),
              radial-gradient(circle at 85% 85%, var(--ham-accent-secondary) 0%, transparent 60%);
  opacity: 0.18;
  transform: translateZ(0);
}

/* Top Bar */
.ham-topbar {
  position: relative;
  z-index: 5;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;

  .topbar-left {
    display: flex;
    align-items: center;
  }

  .app-brand {
    display: flex;
    align-items: center;
    gap: 10px;

    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: var(--ham-accent);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(80, 135, 100, 0.28);
    }

    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;

      .brand-subtitle {
        font-weight: 400;
        opacity: 0.85;
      }
    }

    .brand-tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(80, 135, 100, 0.12);
      color: var(--ham-accent);
      font-weight: 600;
    }
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .connection-status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    background: var(--ham-card-bg);
    border: 1px solid var(--ham-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    &.is-connected {
      .status-dot {
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }
      color: var(--ham-text);
    }

    &.is-connecting {
      .status-dot {
        background: #f59e0b;
      }
      color: #f59e0b;
    }

    &.is-disconnected {
      .status-dot {
        background: #ef4444;
      }
      color: #ef4444;
    }
  }

  .topbar-btn {
    appearance: none;
    border: none;
    background: transparent;
    color: var(--ham-text-dim);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--ham-sidebar-hover);
      color: var(--ham-text);
      transform: translateY(-1px);
    }

    &.is-muted {
      color: #ef4444;
    }
  }

  .user-avatar-badge {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--ham-accent);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(80, 135, 100, 0.3);

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

/* Main Grid Layout */
.ham-layout-body {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 0 20px 18px 20px;
  min-height: 0;
  overflow: hidden;
}

/* Left Sidebar */
.ham-sidebar-card {
  width: 320px;
  flex-shrink: 0;
  background: var(--ham-card-bg);
  border-radius: var(--ham-card-radius);
  border: 1px solid var(--ham-border);
  box-shadow: var(--ham-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 14px 12px 14px;

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .sidebar-title-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .title-text {
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.2px;
      }

      .count-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 1px 7px;
        border-radius: 999px;
        background: var(--ham-sidebar-hover);
        color: var(--ham-text-dim);
      }
    }

    .icon-action-btn {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--ham-text-dim);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ham-sidebar-hover);
        color: var(--ham-text);
        transform: rotate(90deg);
      }
    }
  }

  .sidebar-search-container {
    margin-bottom: 12px;

    .search-input-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 38px;
      border-radius: 999px;
      background: var(--ham-sidebar-bg);
      border: 1px solid var(--ham-border-subtle);

      .search-icon {
        color: var(--ham-text-dim);
        flex-shrink: 0;
      }

      .search-input {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--ham-text);
        font-size: 13px;
        outline: none;

        &::placeholder {
          color: var(--ham-text-dim);
          opacity: 0.75;
        }
      }

      .clear-search-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--ham-text-dim);
        cursor: pointer;
        font-size: 12px;
      }
    }
  }

  .sidebar-tabs-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .tab-pill-btn {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--ham-text-dim);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ham-sidebar-hover);
        color: var(--ham-text);
      }

      &.active {
        background: rgba(80, 135, 100, 0.15);
        color: var(--ham-accent);
        font-weight: 600;
      }
    }
  }

  .sidebar-item-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    margin: 0 -4px 10px 0;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 999px;
    }
  }

  .empty-contacts-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;
    color: var(--ham-text-dim);

    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--ham-sidebar-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }

    .empty-text {
      font-size: 13px;
      margin-bottom: 16px;
      opacity: 0.8;
    }

    .empty-actions-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;

      .empty-link-btn {
        appearance: none;
        border: 1px solid var(--ham-border);
        background: transparent;
        color: var(--ham-accent);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(80, 135, 100, 0.1);
          border-color: var(--ham-accent);
        }
      }
    }
  }

  .contact-room-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 16px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;

    &:hover {
      background: var(--ham-sidebar-hover);
    }

    &.is-active {
      background: rgba(80, 135, 100, 0.12);
    }

    .item-avatar-col {
      position: relative;

      .avatar-circle {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        font-size: 15px;
      }

      .item-speaking-pulse-dot {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        border: 2px solid var(--ham-card-bg);
      }
    }

    .item-meta-col {
      flex: 1;
      min-width: 0;

      .item-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;

        .item-title {
          font-size: 13px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-time {
          font-size: 11px;
          color: var(--ham-text-dim);
          flex-shrink: 0;
        }
      }

      .item-bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 3px;

        .item-preview-text {
          font-size: 12px;
          color: var(--ham-text-dim);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-caller-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--ham-accent);
          font-weight: 600;

          .voice-wave-mini {
            display: inline-flex;
            align-items: flex-end;
            gap: 2px;
            height: 10px;

            span {
              width: 2px;
              height: 100%;
              background: var(--ham-accent);
              border-radius: 1px;
              animation: wavePulseMini 0.7s infinite alternate ease-in-out;

              &:nth-child(2) { animation-delay: 0.2s; }
              &:nth-child(3) { animation-delay: 0.4s; }
            }
          }
        }

        .sub-audio-icon-btn {
          appearance: none;
          border: none;
          background: transparent;
          color: var(--ham-text-dim);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            background: var(--ham-sidebar-hover);
            color: var(--ham-text);
          }

          &.is-subscribed {
            color: var(--ham-accent);
          }
        }
      }
    }
  }

  .sidebar-footer-bar {
    border-top: 1px solid var(--ham-border-subtle);
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .footer-action-buttons {
      display: flex;
      gap: 8px;

      .footer-sub-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        appearance: none;
        border: 1px solid var(--ham-border);
        background: transparent;
        color: var(--ham-text-dim);
        border-radius: 10px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--ham-sidebar-hover);
          color: var(--ham-text);
        }
      }
    }

    .footer-user-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 6px;

      .footer-user-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .mini-user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--ham-accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .user-display-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--ham-text);
        }
      }

      .settings-gear-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--ham-text-dim);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover,
        &.is-active {
          background: var(--ham-sidebar-hover);
          color: var(--ham-accent);
          transform: rotate(45deg);
        }
      }
    }
  }
}

/* Center Main Chat Panel */
.ham-chat-card {
  flex: 1;
  min-width: 0;
  background: var(--ham-card-bg);
  border-radius: var(--ham-card-radius);
  border: 1px solid var(--ham-border);
  box-shadow: var(--ham-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  .chat-main-header {
    height: 60px;
    border-bottom: 1px solid var(--ham-border-subtle);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .chat-header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .target-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--ham-text);
      }

      .target-status-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: var(--ham-text-dim);

        .room-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          .live-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
          }

          &.is-speaking {
            color: var(--ham-accent);
            font-weight: 600;
          }
        }

        .member-tag {
          opacity: 0.8;
        }
      }
    }

    .chat-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-tool-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        appearance: none;
        border: 1px solid var(--ham-border);
        background: transparent;
        color: var(--ham-text);
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--ham-sidebar-hover);
          border-color: var(--ham-accent);
        }

        &.icon-only {
          padding: 6px 8px;
          border-radius: 50%;
        }

        &.is-ptt-active {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }
      }
    }
  }

  .chat-message-feed {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px 80px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.08);
      border-radius: 999px;
    }
  }

  .system-welcome-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    background: var(--ham-sidebar-bg);
    border: 1px dashed var(--ham-border);
    color: var(--ham-text-dim);
    font-size: 12px;
    line-height: 1.5;

    .welcome-icon {
      font-size: 20px;
    }
  }

  .message-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    max-width: 75%;

    &.is-me {
      align-self: flex-end;
      flex-direction: row-reverse;

      .message-meta-row {
        justify-content: flex-end;
      }

      .text-bubble {
        background: var(--ham-accent);
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
    }

    &.is-system {
      align-self: center;
      max-width: 100%;

      .system-pill-bubble {
        padding: 4px 12px;
        border-radius: 999px;
        background: var(--ham-sidebar-bg);
        font-size: 11px;
        color: var(--ham-text-dim);
      }
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: var(--ham-sidebar-hover);
      color: var(--ham-text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }

    .message-body-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .message-meta-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--ham-text-dim);

        .sender-callsign {
          font-weight: 600;
          color: var(--ham-text);
        }

        .sender-ssid {
          opacity: 0.7;
        }

        .message-timestamp {
          opacity: 0.6;
        }
      }

      .text-bubble {
        position: relative;
        padding: 10px 14px;
        border-radius: 16px;
        background: var(--ham-bubble-other);
        color: var(--ham-text);
        font-size: 13.5px;
        line-height: 1.55;
        word-break: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        transition: transform 0.15s ease;

        &:hover .bubble-hover-actions {
          opacity: 1;
          pointer-events: auto;
        }
      }

      .bubble-hover-actions {
        position: absolute;
        top: -12px;
        right: 12px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;

        .bubble-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          appearance: none;
          border: 1px solid var(--ham-border);
          background: var(--ham-card-bg);
          color: var(--ham-text);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          cursor: pointer;

          &:hover {
            background: var(--ham-sidebar-hover);
          }
        }
      }

      .voice-bubble-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 16px;
        background: rgba(80, 135, 100, 0.12);
        border: 1px solid var(--ham-border);
        cursor: pointer;
        color: var(--ham-accent);
        transition: transform 0.15s ease;

        &:hover {
          transform: translateY(-1px);
        }

        .voice-waveform-strip {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 24px;

          span {
            width: 2.5px;
            background: var(--ham-accent);
            border-radius: 2px;
          }
        }

        .voice-duration {
          font-size: 12px;
          font-weight: 600;
        }
      }
    }
  }

  /* Floating Bottom Input Card */
  .floating-input-card {
    position: absolute;
    bottom: 14px;
    left: 20px;
    right: 20px;
    background: var(--ham-input-bg);
    border-radius: 18px;
    border: 1px solid var(--ham-border);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .input-top-area {
      .message-textarea {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--ham-text);
        font-size: 14px;
        line-height: 1.45;
        resize: none;
        outline: none;
        font-family: inherit;
        max-height: 120px;

        &::placeholder {
          color: var(--ham-text-dim);
          opacity: 0.75;
        }
      }
    }

    .input-bottom-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .input-tools-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .tool-circle-btn {
          appearance: none;
          border: none;
          background: transparent;
          color: var(--ham-text-dim);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: var(--ham-sidebar-hover);
            color: var(--ham-text);
          }
        }

        .send-shortcut-hint {
          font-size: 11px;
          color: var(--ham-text-dim);
          opacity: 0.7;
        }
      }

      .circular-send-btn {
        appearance: none;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #cbd5e1;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: not-allowed;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        &.can-send {
          background: var(--ham-accent);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(80, 135, 100, 0.35);

          &:hover {
            transform: scale(1.08);
          }
          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }
}

/* Right Appearance & Settings Drawer */
.ham-settings-drawer {
  width: 320px;
  flex-shrink: 0;
  background: var(--ham-card-bg);
  border-radius: var(--ham-card-radius);
  border: 1px solid var(--ham-border);
  box-shadow: var(--ham-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 14px;
  animation: slideInRight 0.2s ease-out;

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .drawer-header-titles {
      display: flex;
      flex-direction: column;

      .drawer-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--ham-text);
      }
      .drawer-subtitle {
        font-size: 11px;
        color: var(--ham-text-dim);
      }
    }

    .close-drawer-btn {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--ham-text-dim);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        background: var(--ham-sidebar-hover);
        color: var(--ham-text);
      }
    }
  }

  .drawer-tabs-row {
    display: flex;
    gap: 6px;
    padding: 4px;
    border-radius: 12px;
    background: var(--ham-sidebar-bg);
    margin-bottom: 16px;

    .drawer-tab-btn {
      flex: 1;
      appearance: none;
      border: none;
      background: transparent;
      color: var(--ham-text-dim);
      padding: 6px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--ham-text);
      }

      &.active {
        background: var(--ham-card-bg);
        color: var(--ham-text);
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
    }
  }

  .drawer-content-scroll {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 999px;
    }
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .section-title-row {
      display: flex;
      align-items: center;
      gap: 6px;

      .section-badge-icon {
        font-size: 14px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--ham-text);
      }
    }

    .slider-control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .slider-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;

        .slider-label {
          color: var(--ham-text-dim);
        }
        .slider-value-display {
          font-weight: 600;
          color: var(--ham-text);
        }
      }

      .ham-range-slider {
        appearance: none;
        width: 100%;
        height: 5px;
        border-radius: 999px;
        background: var(--ham-sidebar-bg);
        outline: none;

        &::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--ham-accent);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(80, 135, 100, 0.4);
        }
      }
    }

    .color-palette-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;

      .color-palette-item {
        appearance: none;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.1);
        }

        &.is-selected {
          box-shadow: 0 0 0 2px var(--ham-card-bg), 0 0 0 4px var(--ham-accent);
        }
      }
    }

    .selected-theme-name {
      font-size: 12px;
      color: var(--ham-text-dim);
      text-align: center;
    }

    .segmented-option-row {
      display: flex;
      gap: 6px;

      .seg-option-btn {
        flex: 1;
        appearance: none;
        border: 1px solid var(--ham-border);
        background: transparent;
        color: var(--ham-text-dim);
        padding: 6px 4px;
        border-radius: 8px;
        font-size: 11px;
        cursor: pointer;

        &.active {
          border-color: var(--ham-accent);
          background: rgba(80, 135, 100, 0.1);
          color: var(--ham-accent);
          font-weight: 600;
        }
      }
    }

    .bubble-preview-card {
      padding: 12px;
      background: var(--ham-sidebar-bg);
      border-radius: 12px;
      font-size: 12px;
      color: var(--ham-text);
      line-height: 1.4;
    }

    .account-info-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background: var(--ham-sidebar-bg);
      font-size: 12px;

      .info-row {
        display: flex;
        justify-content: space-between;

        .info-label {
          color: var(--ham-text-dim);
        }
        .info-val {
          color: var(--ham-text);
        }
        .green-text {
          color: #10b981;
          font-weight: 600;
        }
      }
    }
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(18px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes wavePulseMini {
  from { height: 3px; }
  to { height: 10px; }
}

@media (max-width: 1024px) {
  .ham-settings-drawer {
    position: absolute;
    right: 20px;
    top: 0;
    bottom: 18px;
    z-index: 10;
  }
}

@media (max-width: 768px) {
  .ham-layout-body {
    padding: 0 10px 10px 10px;
    gap: 10px;
  }
  .ham-sidebar-card {
    width: 80px;
    padding: 12px 8px;
    .sidebar-search-container,
    .sidebar-tabs-row,
    .item-meta-col,
    .empty-actions-col,
    .footer-action-buttons,
    .user-display-name {
      display: none;
    }
  }
  .ham-settings-drawer {
    width: calc(100% - 20px);
    left: 10px;
    right: 10px;
  }
}
</style>
