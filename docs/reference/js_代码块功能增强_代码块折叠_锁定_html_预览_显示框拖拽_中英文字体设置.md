# [js] 代码块功能增强：代码块折叠、锁定、html 预览、显示框拖拽、中英文字体设置

---

- [js] 代码块功能增强：代码块折叠、锁定、html 预览、显示框拖拽、中英文字体设置 - 链滴
- [https://ld246.com/article/1764868988070](https://ld246.com/article/1764868988070)
- 1、代码片段 // v5.1 2025.12.6 // 代码块折叠与展开、默认高度设置、锁定、预览HTML、实时调整高度、代码块和行级代码字体设置 // 更新：新增行级代码字体设置 // 功能描述 // 在代码块右上角添加 预览、锁定、折叠功能按钮（保留原本的复制、更多按钮），右下角添加拖拽控件 // 添加的功能 //
- 2025-12-21 11:30

---

‍

```javascript
// v5.1  2025.12.6
// 代码块折叠与展开、默认高度设置、锁定、预览HTML、实时调整高度、代码块和行级代码字体设置
// 更新：新增行级代码字体设置
// 功能描述
// 在代码块右上角添加 预览、锁定、折叠功能按钮（保留原本的复制、更多按钮），右下角添加拖拽控件
// 添加的功能
//   - 折叠代码块，将代码块折叠为指定的默认高度，折叠后可通过鼠标滚轮滚动浏览
//       可通过添加属性 set-height 调整某一代码块的默认折叠高度
//       设置为具体值，如 100px 150px 则默认折叠为该高度
//       设置为 auto ，则默认展开代码块
//   - 锁定代码块，锁定后被折叠代码块无法滚动，可设置全局默认锁定或不锁定
//       通过添加属性 set-lock 设置某一代码块的默认锁定状态
//       设置为 lock 或 true，则默认锁定，无法滚动
//       设置为 unlock 或 false，则默认解锁，可以滚动
//   - 拖拽代码块，折叠状态下通过拖拽代码块右下角角标，临时调整代码块显示区域高度
//   - 预览 HTML 代码块
//   - 代码块和行级代码字体修改，根据字体优先级设置中英文的字体（类似vscode）

(() => {
    // 功能参数配置
    const CONFIG = {
        codeMaxHeight: "112px",// 默认折叠高度，设置为无效数据则会默认展开
        enablePreview: false,
        defaultLockState: false, // 默认锁定状态：false=默认解锁，true=默认锁定
        enableResize: true, // 启用拖拽调整代码块高度
        // Fira Code, Consolas, Hack, MonacoB, Cascadia Code,'霞鹜文楷', '思源黑体', '黑体', Maple Mono NF CN
        codeFontFamily: '"Fira Code", Consolas, "霞鹜文楷", "黑体", "Courier New", monospace', // 代码块字体
        inlineCodeFontFamily: '"Fira Code", Consolas, "霞鹜文楷", "黑体", "Courier New", monospace', // 行级代码字体
        enableScrollbar: true, // 自动显示滚动栏
        minResizeHeight: 50, // 最小拖拽高度(px)
        maxResizeHeight: "80vh", // 最大拖拽高度
        throttleDelay: 50,
        resizeDelay: 100,
    };
    // 屏蔽手机版
    if (isMobile()) return;
    // 缓存系统
    const cache = {
        heightValues: new Map(),
        processingBlocks: new WeakSet(),
        scrollbarInstances: new WeakMap(),
        lockStates: new WeakMap(),
        expandStates: new WeakMap(),
        resizeInstances: new WeakMap(),
        customHeights: new WeakMap(),
    };
    // 常量定义
    const SELECTORS = {
        layoutCenter: ".layout__center, #editor",
        protyle: ".protyle",
        protyleContent: ".protyle-content",
        codeBlock: ".code-block",
        hljs: ".hljs",
        moreBtn: ".protyle-icon--last",
        scrollbarContainer: ".scrollbar-container",
    };
    const ICONS = {
        lock: { locked: "iconLock", unlocked: "iconUnlock" },
        expand: { collapsed: "iconLeft", expanded: "iconDown" },
        preview: "iconPreview",
    };
    // 节流函数
    function throttle(func, delay) {
        let timeoutId = null;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = performance.now();
            const timeSinceLastExec = currentTime - lastExecTime;
            if (timeSinceLastExec >= delay) {
                lastExecTime = currentTime;
                func.apply(this, args);
            } else if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    timeoutId = null;
                    lastExecTime = performance.now();
                    func.apply(this, args);
                }, delay - timeSinceLastExec);
            }
        };
    }
    // 防抖函数
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    // 全局测试元素（避免重复创建）
    let globalTestEl = null;
    function getTestElement() {
        if (!globalTestEl) {
            globalTestEl = document.createElement("div");
            globalTestEl.style.cssText = "position:absolute;visibility:hidden;";
        }
        return globalTestEl;
    }
    // 高度解析函数
    function parseHeightToPixels(value) {
        if (typeof value === "number") return value;
        if (cache.heightValues.has(value)) return cache.heightValues.get(value);
        let result = 0;
        if (typeof value === "string") {
            if (/^\d+\.?\d*$/.test(value)) {
                result = parseFloat(value);
            } else if (value.endsWith("px")) {
                result = parseFloat(value);
            } else {
                const testEl = getTestElement();
                testEl.style.height = value;
                document.body.appendChild(testEl);
                result = testEl.offsetHeight;
                document.body.removeChild(testEl);
            }
        }
        cache.heightValues.set(value, result);
        return result;
    }
    // 代码块高度获取
    function getCodeBlockMaxHeight(codeBlock) {
        // 优先使用拖拽设置的高度
        if (cache.customHeights.has(codeBlock)) {
            return cache.customHeights.get(codeBlock) + "px";
        }
        const setHeightValue = codeBlock.getAttribute("custom-set-height");
        if (!setHeightValue || setHeightValue === "auto") {
            return CONFIG.codeMaxHeight;
        }
        return /^\d+px$/.test(setHeightValue)
            ? setHeightValue
            : CONFIG.codeMaxHeight;
    }
    // 状态管理器
    class StateManager {
        static shouldDefaultExpand(codeBlock) {
            return codeBlock.getAttribute("custom-set-height") === "auto";
        }
        static shouldBeLocked(codeBlock) {
            const lockAttr = codeBlock.getAttribute("custom-set-lock");
            if (lockAttr === "lock" || lockAttr === "true") return true;
            if (lockAttr === "unlock" || lockAttr === "false") return false;
            return CONFIG.defaultLockState;
        }
        static getLockState(codeBlock) {
            return cache.lockStates.has(codeBlock)
                ? cache.lockStates.get(codeBlock)
                : StateManager.shouldBeLocked(codeBlock);
        }
        static setLockState(codeBlock, isLocked) {
            cache.lockStates.set(codeBlock, isLocked);
        }
        static getExpandState(codeBlock) {
            return cache.expandStates.has(codeBlock)
                ? cache.expandStates.get(codeBlock)
                : StateManager.shouldDefaultExpand(codeBlock);
        }
        static setExpandState(codeBlock, isExpanded) {
            cache.expandStates.set(codeBlock, isExpanded);
        }
    }
    // 样式应用器
    class StyleApplicator {
        static applyLockState(codeBlock, isLocked) {
            const hljs = codeBlock.querySelector(SELECTORS.hljs);
            const scrollbarInstance = cache.scrollbarInstances.get(codeBlock);
            const expandBtn = codeBlock.querySelector(".protyle-icon--expand");
            const resizeHandle = codeBlock.querySelector(".resize-handle");
            if (isLocked) {
                const isExpanded = StateManager.getExpandState(codeBlock);
                const maxHeight = isExpanded
                    ? "none"
                    : getCodeBlockMaxHeight(codeBlock);
                Object.assign(hljs.style, {
                    maxHeight: maxHeight,
                    overflow: "hidden",
                    overflowX: "hidden",
                    overflowY: "hidden",
                });
                scrollbarInstance?.disable();
                if (expandBtn) expandBtn.style.display = "none";
                if (resizeHandle) resizeHandle.style.display = "none";
            } else {
                const isExpanded = StateManager.getExpandState(codeBlock);
                const targetHeight = isExpanded
                    ? "none"
                    : getCodeBlockMaxHeight(codeBlock);
                Object.assign(hljs.style, {
                    maxHeight: targetHeight,
                    overflow: "",
                    overflowX: "",
                    overflowY: "",
                });
                scrollbarInstance?.enable();
                if (expandBtn) expandBtn.style.display = "";
                if (resizeHandle) resizeHandle.style.display = isExpanded ? "none" : "";
            }
            codeBlock.classList.toggle("code-block--locked", isLocked);
            codeBlock.dataset.locked = isLocked ? "true" : "false";
        }
        static applyExpandState(codeBlock, isExpanded) {
            const hljs = codeBlock.querySelector(SELECTORS.hljs);
            const isLocked = StateManager.getLockState(codeBlock);
            const resizeHandle = codeBlock.querySelector(".resize-handle");
            if (isLocked) return;
            const targetHeight = isExpanded
                ? "none"
                : getCodeBlockMaxHeight(codeBlock);
            hljs.style.maxHeight = targetHeight;
            if (resizeHandle) {
                resizeHandle.style.display = isExpanded ? "none" : "";
            }
            codeBlock.dataset.expanded = isExpanded ? "true" : "false";
            const scrollbarInstance = cache.scrollbarInstances.get(codeBlock);
            scrollbarInstance?.updateAll();
        }
    }
    // 滚动条控制器
    class ScrollbarController {
        constructor(code, hljs, protyleContent) {
            this.code = code;
            this.hljs = hljs;
            this.protyleContent = protyleContent;
            this.isDragging = false;
            this.isDisabled = false;
            this.startX = 0;
            this.thumbStartX = 0;
            this.originalOverflowX = getComputedStyle(hljs).overflowX;
            this.boundMethods = {
                handleMouseMove: this.handleMouseMove.bind(this),
                handleMouseUp: this.handleMouseUp.bind(this),
                updateVisibilityThrottled: throttle(
                    this.updateVisibility.bind(this),
                    CONFIG.throttleDelay
                ),
                updateAllThrottled: throttle(
                    this.updateAll.bind(this),
                    CONFIG.throttleDelay
                ),
                syncPosition: this.syncPosition.bind(this),
                handleHljsScroll: this.handleHljsScroll.bind(this),
            };
        }
        init() {
            if (this.code.querySelector(SELECTORS.scrollbarContainer)) return;
            const scrollbarHtml = `
                <div class="scrollbar-container protyle-custom">
                    <div class="scrollbar-thumb"></div>
                </div>`;
            this.hljs.insertAdjacentHTML("afterend", scrollbarHtml);
            this.container = this.code.querySelector(".scrollbar-container");
            this.thumb = this.container.querySelector(".scrollbar-thumb");
            this.bindEvents();
            this.updateAll();
        }
        bindEvents() {
            this.hljs.addEventListener("scroll", this.boundMethods.handleHljsScroll, {
                passive: true,
            });
            if (this.protyleContent) {
                this.protyleContent.addEventListener(
                    "scroll",
                    this.boundMethods.updateVisibilityThrottled,
                    { passive: true }
                );
            }
            this.thumb.addEventListener("mousedown", this.startDrag.bind(this));
            window.addEventListener("resize", this.boundMethods.updateAllThrottled, {
                passive: true,
            });
        }
        handleHljsScroll() {
            // 锁定状态下重置滚动位置，阻止代码块滚动
            // CSS overflow:hidden 会阻止鼠标滚轮滚动代码块，但滚轮事件会冒泡让页面滚动
            // 此方法作为后备，处理其他可能导致滚动的情况
            const isLocked = StateManager.getLockState(this.code);
            if (isLocked) {
                this.hljs.scrollTop = 0;
                this.hljs.scrollLeft = 0;
                return;
            }
            this.syncPosition();
        }
        updateVisibility() {
            // 早期返回，避免不必要的计算
            if (this.isDisabled) {
                this.container.classList.add("f__hidden");
                return;
            }
            const isLocked = StateManager.getLockState(this.code);
            const isExpanded = StateManager.getExpandState(this.code);
            if (isLocked || isExpanded) {
                this.container.classList.add("f__hidden");
                return;
            }
            // 仅在需要时计算
            const hasHorizontalScrollbar =
                this.hljs.scrollWidth > this.hljs.clientWidth;
            if (!hasHorizontalScrollbar) {
                this.container.classList.add("f__hidden");
                this.hljs.style.overflowX = this.originalOverflowX;
                return;
            }
            const currentMaxHeight = getCodeBlockMaxHeight(this.code);
            const isHeightExceeded =
                this.hljs.scrollHeight > parseHeightToPixels(currentMaxHeight);
            if (!isHeightExceeded) {
                this.container.classList.add("f__hidden");
                this.hljs.style.overflowX = this.originalOverflowX;
                return;
            }
            const isSticky = !isElementBottomInViewport(this.code);
            if (isSticky) {
                this.container.classList.remove("f__hidden");
                this.hljs.style.overflowX = "hidden";
            } else {
                this.container.classList.add("f__hidden");
                this.hljs.style.overflowX = this.originalOverflowX;
            }
        }
        updateSize() {
            const contentWidth = this.hljs.scrollWidth;
            const viewportWidth = this.hljs.clientWidth;
            if (contentWidth <= viewportWidth) {
                this.thumb.style.width = "0px";
                return;
            }
            const thumbWidth = Math.max(
                (viewportWidth / contentWidth) * this.container.offsetWidth,
                30
            );
            this.thumb.style.width = `${thumbWidth}px`;
        }
        syncPosition() {
            const maxScroll = this.hljs.scrollWidth - this.hljs.clientWidth;
            if (maxScroll <= 0) {
                this.thumb.style.left = "0px";
                return;
            }
            const scrollPercentage = this.hljs.scrollLeft / maxScroll;
            const thumbMaxMove = this.container.offsetWidth - this.thumb.offsetWidth;
            this.thumb.style.left = `${scrollPercentage * thumbMaxMove}px`;
        }
        updateAll() {
            if (this.isDisabled) {
                this.container?.classList.add("f__hidden");
                return;
            }
            const isLocked = StateManager.getLockState(this.code);
            if (isLocked) {
                this.container?.classList.add("f__hidden");
                return;
            }
            // 直接调用未throttle的方法，避免RAF内双重延迟
            this.updateVisibility();
            this.updateSize();
            this.syncPosition();
        }
        startDrag(e) {
            if (this.isDisabled || StateManager.getLockState(this.code)) {
                return;
            }
            this.isDragging = true;
            this.startX = e.clientX;
            this.thumbStartX = parseFloat(this.thumb.style.left) || 0;
            this.hljs.style.userSelect = "none";
            document.body.style.cursor = "grabbing";
            // 拖拽时禁用transition确保跟手
            this.thumb.style.transition = "none";
            document.addEventListener("mousemove", this.boundMethods.handleMouseMove);
            document.addEventListener("mouseup", this.boundMethods.handleMouseUp);
            e.preventDefault();
        }
        handleMouseMove(e) {
            if (!this.isDragging || this.isDisabled) return;
            const deltaX = e.clientX - this.startX;
            const thumbMaxMove = this.container.offsetWidth - this.thumb.offsetWidth;
            const newThumbPosition = Math.max(
                0,
                Math.min(this.thumbStartX + deltaX, thumbMaxMove)
            );
            this.thumb.style.left = `${newThumbPosition}px`;
            if (this.hljs.scrollWidth > this.hljs.clientWidth) {
                const scrollPercentage = newThumbPosition / thumbMaxMove;
                this.hljs.scrollLeft =
                    scrollPercentage * (this.hljs.scrollWidth - this.hljs.clientWidth);
            }
            e.preventDefault();
        }
        handleMouseUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.hljs.style.userSelect = "";
            document.body.style.cursor = "";
            // 恢复transition
            this.thumb.style.transition = "";
            document.removeEventListener(
                "mousemove",
                this.boundMethods.handleMouseMove
            );
            document.removeEventListener("mouseup", this.boundMethods.handleMouseUp);
        }
        disable() {
            this.isDisabled = true;
            this.container.classList.add("f__hidden");
            if (!StateManager.getLockState(this.code)) {
                this.hljs.style.overflowX = this.originalOverflowX;
            }
        }
        enable() {
            this.isDisabled = false;
            setTimeout(() => this.updateAll(), CONFIG.resizeDelay);
        }
        destroy() {
            document.removeEventListener(
                "mousemove",
                this.boundMethods.handleMouseMove
            );
            document.removeEventListener("mouseup", this.boundMethods.handleMouseUp);
            window.removeEventListener(
                "resize",
                this.boundMethods.updateAllThrottled
            );
            this.hljs.removeEventListener(
                "scroll",
                this.boundMethods.handleHljsScroll
            );
            this.container?.remove();
            cache.scrollbarInstances.delete(this.code);
        }
    }
    // 高度调整控制器
    class ResizeController {
        constructor(code, hljs) {
            this.code = code;
            this.hljs = hljs;
            this.isDragging = false;
            this.startY = 0;
            this.startHeight = 0;
            this.minHeight = CONFIG.minResizeHeight;
            this.maxHeight = parseHeightToPixels(CONFIG.maxResizeHeight);
            this.rafId = null;
            this.boundMethods = {
                handleMouseMove: this.handleMouseMove.bind(this),
                handleMouseUp: this.handleMouseUp.bind(this),
            };
        }
        init() {
            if (this.code.querySelector(".resize-handle")) return;
            const resizeHandleHtml = `<div class="resize-handle protyle-custom"></div>`;
            const scrollbarContainer = this.code.querySelector(
                SELECTORS.scrollbarContainer
            );
            if (scrollbarContainer) {
                scrollbarContainer.insertAdjacentHTML("afterend", resizeHandleHtml);
            } else {
                this.hljs.insertAdjacentHTML("afterend", resizeHandleHtml);
            }
            this.handle = this.code.querySelector(".resize-handle");
            this.bindEvents();
        }
        bindEvents() {
            this.handle.addEventListener("mousedown", this.startDrag.bind(this));
        }
        startDrag(e) {
            const isLocked = StateManager.getLockState(this.code);
            const isExpanded = StateManager.getExpandState(this.code);
            if (isLocked || isExpanded) return;
            this.isDragging = true;
            this.startY = e.clientY;
            this.startHeight = this.hljs.offsetHeight;
            document.body.style.cursor = "nwse-resize";
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", this.boundMethods.handleMouseMove);
            document.addEventListener("mouseup", this.boundMethods.handleMouseUp);
            e.preventDefault();
        }
        handleMouseMove(e) {
            if (!this.isDragging) return;
            // 取消上一帧的RAF，避免重复渲染
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            // 使用 requestAnimationFrame 优化性能
            this.rafId = requestAnimationFrame(() => {
                const deltaY = e.clientY - this.startY;
                let newHeight = this.startHeight + deltaY;
                // 限制高度范围
                newHeight = Math.max(
                    this.minHeight,
                    Math.min(newHeight, this.maxHeight)
                );
                this.hljs.style.maxHeight = `${newHeight}px`;
                cache.customHeights.set(this.code, newHeight);
            });
            e.preventDefault();
        }
        handleMouseUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            // 拖拽结束后统一更新滚动条
            const scrollbarInstance = cache.scrollbarInstances.get(this.code);
            scrollbarInstance?.updateAll();
            document.removeEventListener(
                "mousemove",
                this.boundMethods.handleMouseMove
            );
            document.removeEventListener("mouseup", this.boundMethods.handleMouseUp);
        }
        destroy() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            document.removeEventListener(
                "mousemove",
                this.boundMethods.handleMouseMove
            );
            document.removeEventListener("mouseup", this.boundMethods.handleMouseUp);
            this.handle?.remove();
            cache.resizeInstances.delete(this.code);
        }
    }
    // 按钮创建器
    class ButtonCreator {
        static createButton(iconName, ariaLabel, className) {
            return `<span class="b3-tooltips__nw b3-tooltips protyle-icon ${className} protyle-custom" aria-label="${ariaLabel}">
                <svg><use xlink:href="#${iconName}"></use></svg>
            </span>`;
        }
        static updateButtonIcon(button, iconName, ariaLabel) {
            const useEl = button.querySelector("svg > use");
            if (useEl) {
                useEl.setAttributeNS(
                    "http://www.w3.org/1999/xlink",
                    "xlink:href",
                    "#" + iconName
                );
            }
            button.setAttribute("aria-label", ariaLabel);
        }
        static createLockButton(isLocked) {
            const iconName = isLocked ? ICONS.lock.locked : ICONS.lock.unlocked;
            const ariaLabel = isLocked ? "取消锁定" : "锁定";
            return ButtonCreator.createButton(
                iconName,
                ariaLabel,
                "protyle-icon--lock protyle-action__lock"
            );
        }
        static createExpandButton(isExpanded) {
            const iconName = isExpanded
                ? ICONS.expand.expanded
                : ICONS.expand.collapsed;
            const ariaLabel = isExpanded ? "折叠" : "展开";
            return ButtonCreator.createButton(
                iconName,
                ariaLabel,
                "protyle-icon--expand protyle-action__expand"
            );
        }
        static createPreviewButton() {
            return ButtonCreator.createButton(
                ICONS.preview,
                "预览",
                "protyle-icon--preview protyle-action__preview"
            );
        }
    }
    // 事件处理器
    class EventHandlers {
        static handleLockClick(code, lockBtn) {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentLockState = StateManager.getLockState(code);
                const newLockState = !currentLockState;
                StateManager.setLockState(code, newLockState);
                const newIconName = newLockState
                    ? ICONS.lock.locked
                    : ICONS.lock.unlocked;
                const newAriaLabel = newLockState ? "取消锁定" : "锁定";
                ButtonCreator.updateButtonIcon(lockBtn, newIconName, newAriaLabel);
                StyleApplicator.applyLockState(code, newLockState);
                const scrollbarInstance = cache.scrollbarInstances.get(code);
                scrollbarInstance?.updateAll();
            };
        }
        static handleExpandClick(code, expandBtn) {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (StateManager.getLockState(code)) return;
                const currentExpandState = StateManager.getExpandState(code);
                const newExpandState = !currentExpandState;
                StateManager.setExpandState(code, newExpandState);
                const newIconName = newExpandState
                    ? ICONS.expand.expanded
                    : ICONS.expand.collapsed;
                const newAriaLabel = newExpandState ? "折叠" : "展开";
                ButtonCreator.updateButtonIcon(expandBtn, newIconName, newAriaLabel);
                StyleApplicator.applyExpandState(code, newExpandState);
            };
        }
        static handlePreviewClick() {
            return (e) => {
                e.preventDefault();
                e.stopPropagation();
                const code = e.target.closest(SELECTORS.codeBlock);
                const lang = code
                    .querySelector(".protyle-action__language")
                    ?.textContent?.trim()
                    ?.toLowerCase();
                if (!["html", "js", "javascript"].includes(lang)) {
                    showMessage("目前仅支持HTML和JavaScript代码预览", true);
                    return;
                }
                const hljs = code.querySelector(SELECTORS.hljs);
                const codeElement = hljs.querySelector('[contenteditable="true"]');
                if (!codeElement) {
                    showMessage("无法获取代码内容", true);
                    return;
                }
                let codeText = codeElement.textContent;
                if (["js", "javascript"].includes(lang) && !/<script/i.test(codeText)) {
                    codeText = `<script>${codeText}</script>`;
                }
                ModalManager.open(codeText);
            };
        }
    }
    // 模态框管理器
    class ModalManager {
        static initialize() {
            if (document.getElementById("modal-preview")) return;
            document.body.insertAdjacentHTML(
                "beforeend",
                `
                <div id="modal-preview">
                    <div id="modal-preview-content">
                        <span id="modal-preview-close">❌</span>
                        <iframe id="modal-preview-iframe" sandbox="allow-scripts allow-same-origin allow-modals"></iframe>
                    </div>
                </div>
            `
            );
            const modal = document.getElementById("modal-preview");
            modal.addEventListener("click", (event) => {
                if (
                    event.target === modal ||
                    event.target.id === "modal-preview-close"
                ) {
                    ModalManager.close();
                }
            });
        }
        static open(code) {
            const iframe = document.getElementById("modal-preview-iframe");
            const modal = document.getElementById("modal-preview");
            if (!iframe || !modal) return;
            iframe.srcdoc = code;
            modal.style.display = "block";
        }
        static close() {
            const modal = document.getElementById("modal-preview");
            const iframe = document.getElementById("modal-preview-iframe");
            if (modal) modal.style.display = "none";
            if (iframe) iframe.srcdoc = "";
        }
    }
    // 注入样式
    function addStyle(css) {
        const existingStyle = document.getElementById("code-block-enhancer-style");
        if (existingStyle) {
            existingStyle.textContent = css;
            return;
        }
        const style = document.createElement("style");
        style.id = "code-block-enhancer-style";
        style.textContent = css;
        document.head.appendChild(style);
    }
    // 主要处理函数
    async function addCodeExtends(codeBlocks, protyle) {
        if (!codeBlocks?.length) return;
        const processPromises = Array.from(codeBlocks).map(async (code) => {
            if (
                cache.processingBlocks.has(code) ||
                code.querySelector(".protyle-icon--expand")
            ) {
                return;
            }
            cache.processingBlocks.add(code);
            try {
                const hljs = code.querySelector(SELECTORS.hljs);
                const moreBtn = code.querySelector(SELECTORS.moreBtn);
                if (!hljs || !moreBtn) return;
                await whenElementExist(() => moreBtn.getAttribute("aria-label"));
                // 初始化状态
                const isLocked = StateManager.getLockState(code);
                const shouldExpand = StateManager.shouldDefaultExpand(code);
                StateManager.setExpandState(code, shouldExpand);
                // 创建并添加按钮
                const buttons = await createButtons(
                    code,
                    moreBtn,
                    isLocked,
                    shouldExpand
                );
                setupButtonEvents(code, buttons, protyle);
                // 设置滚动条
                if (CONFIG.enableScrollbar) {
                    setupScrollbar(code, hljs, protyle);
                }
                // 设置高度拖拽
                if (CONFIG.enableResize) {
                    setupResize(code, hljs);
                }
                // 应用初始状态
                StyleApplicator.applyLockState(code, isLocked);
                StyleApplicator.applyExpandState(code, shouldExpand);
            } catch (error) {
                console.error("处理代码块失败:", error);
                cache.processingBlocks.delete(code);
            }
        });
        await Promise.allSettled(processPromises);
    }
    // 按钮创建和事件设置
    async function createButtons(code, moreBtn, isLocked, isExpanded) {
        const buttons = {};
        // 锁定按钮
        moreBtn.insertAdjacentHTML(
            "beforebegin",
            ButtonCreator.createLockButton(isLocked)
        );
        buttons.lock = code.querySelector(".protyle-icon--lock");
        // 展开按钮
        buttons.lock.insertAdjacentHTML(
            "beforebegin",
            ButtonCreator.createExpandButton(isExpanded)
        );
        buttons.expand = code.querySelector(".protyle-icon--expand");
        // 预览按钮
        if (CONFIG.enablePreview) {
            buttons.expand.insertAdjacentHTML(
                "beforebegin",
                ButtonCreator.createPreviewButton()
            );
            buttons.preview = code.querySelector(".protyle-icon--preview");
        }
        return buttons;
    }
    function setupButtonEvents(code, buttons, protyle) {
        // 锁定按钮事件
        buttons.lock.addEventListener(
            "click",
            EventHandlers.handleLockClick(code, buttons.lock)
        );
        // 展开按钮事件
        buttons.expand.addEventListener(
            "click",
            EventHandlers.handleExpandClick(code, buttons.expand)
        );
        // 预览按钮事件
        if (buttons.preview) {
            buttons.preview.addEventListener(
                "click",
                EventHandlers.handlePreviewClick()
            );
        }
    }
    function setupScrollbar(code, hljs, protyle) {
        if (code.querySelector(SELECTORS.scrollbarContainer)) return;
        const protyleContent = protyle.querySelector(SELECTORS.protyleContent);
        const scrollbarInstance = new ScrollbarController(
            code,
            hljs,
            protyleContent
        );
        scrollbarInstance.init();
        cache.scrollbarInstances.set(code, scrollbarInstance);
    }
    function setupResize(code, hljs) {
        if (!CONFIG.enableResize || code.querySelector(".resize-handle")) return;
        const resizeInstance = new ResizeController(code, hljs);
        resizeInstance.init();
        cache.resizeInstances.set(code, resizeInstance);
    }
    // 工具函数
    function observeProtyleLoaded(el, callback) {
        const observer = new MutationObserver((mutationsList) => {
            const protyles = new Set();
            const codeBlocks = new Set();
            for (const mutation of mutationsList) {
                if (mutation.type !== "childList") continue;
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    // 检查是否是protyle
                    if (
                        node.classList?.contains("protyle") ||
                        node.classList?.contains("protyle-content")
                    ) {
                        protyles.add(node);
                    }
                    // 检查是否是代码块
                    if (
                        node.matches?.(
                            SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
                        )
                    ) {
                        codeBlocks.add(node);
                    }
                    // 检查子元素中的代码块
                    const childCodeBlocks = node.querySelectorAll?.(
                        SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
                    );
                    if (childCodeBlocks?.length) {
                        childCodeBlocks.forEach((cb) => codeBlocks.add(cb));
                    }
                }
            }
            // 处理新发现的代码块
            if (codeBlocks.size > 0) {
                codeBlocks.forEach((codeBlock) => {
                    const protyle = codeBlock.closest(SELECTORS.protyle);
                    if (protyle) {
                        setTimeout(() => addCodeExtends([codeBlock], protyle), 10);
                    }
                });
            }
            // 处理新的protyle
            if (protyles.size > 0) {
                callback(Array.from(protyles));
            }
        });
        observer.observe(el, { childList: true, subtree: true });
        return () => observer.disconnect();
    }
    function whenElementExist(selector, node = document, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                try {
                    // 检查超时
                    if (Date.now() - startTime > timeout) {
                        reject(new Error(`等待元素超时: ${timeout}ms`));
                        return;
                    }
                    const el =
                        typeof selector === "function"
                            ? selector()
                            : node.querySelector(selector);
                    if (el) {
                        resolve(el);
                    } else {
                        requestAnimationFrame(check);
                    }
                } catch (e) {
                    requestAnimationFrame(check);
                }
            };
            check();
        });
    }
    function isMobile() {
        return !!document.getElementById("sidebar");
    }
    function showMessage(message, isError = false, delay = 7000) {
        const endpoint = isError ? "pushErrMsg" : "pushMsg";
        return fetch(`/api/notification/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ msg: message, timeout: delay }),
        }).catch((error) => {
            console.warn("显示消息失败:", error);
        });
    }
    function isElementBottomInViewport(el) {
        if (!el) return false;
        try {
            const rect = el.getBoundingClientRect();
            const windowHeight =
                window.innerHeight || document.documentElement.clientHeight;
            return rect.bottom <= windowHeight;
        } catch (e) {
            return false;
        }
    }
    // 主初始化函数
    async function initialize() {
        try {
            // 注入样式
            const resizeGradient = `
                linear-gradient(
                    135deg,
                    transparent 0%,
                    transparent 40%,
                    var(--resize-handle-color) 40%,
                    var(--resize-handle-color) 45%,
                    transparent 45%,
                    transparent 55%,
                    var(--resize-handle-color) 55%,
                    var(--resize-handle-color) 60%,
                    transparent 60%,
                    transparent 70%,
                    var(--resize-handle-color) 70%,
                    var(--resize-handle-color) 75%,
                    transparent 75%
                )`;

            addStyle(`
                .b3-typography div.hljs, .protyle-wysiwyg .code-block div.hljs {
                    font-family: ${CONFIG.codeFontFamily};
                    transition: max-height 0.3s ease;
                }
              
                /* 行级代码字体样式 */
                .fn__code,
                .b3-typography code:not(.hljs),
                .b3-typography span[data-type~=code],
                .protyle-wysiwyg code:not(.hljs),
                .protyle-wysiwyg span[data-type~=code] {
                    font-family: ${CONFIG.inlineCodeFontFamily};
                }
                .b3-typography .code-block:not(pre), .protyle-wysiwyg .code-block:not(pre) {
                    margin: 2px 0; padding: 4px;
                    position: relative;
                }
                .b3-typography div.hljs, .protyle-wysiwyg div.hljs {
                    padding: 0px 1em 1.6em;
                }
                .b3-typography div.protyle-action, .protyle-wysiwyg .code-block div.protyle-action {
                    position: sticky;
                }
                .scrollbar-container {
                    position: sticky; bottom: 0; width: 100%; height: 8px; cursor: pointer;
                    border-radius: 5px; z-index: 9999;
                    transition: opacity 150ms ease;
                }
                .scrollbar-thumb {
                    position: absolute; top: 0; left: 0; height: 100%; width: 20%;
                    box-shadow: inset 0 0 5px 5px var(--b3-scroll-color);
                    border-radius: 5px; cursor: grab;
                    transition: left 0.1s ease;
                }
                .scrollbar-thumb:active { cursor: grabbing; }
                .scrollbar-container.f__hidden {
                    opacity: 0; pointer-events: none; height: 0;
                }
                .code-block--locked .hljs {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                .code-block--locked .hljs::-webkit-scrollbar {
                    display: none !important;
                }
                .resize-handle {
                    --resize-handle-color: var(--b3-border-color);
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 14px;
                    height: 14px;
                    cursor: nwse-resize;
                    z-index: 10;
                    background: ${resizeGradient};
                    opacity: 0.5;
                    transition: opacity 150ms ease;
                }
                .resize-handle:hover {
                    --resize-handle-color: var(--b3-theme-primary);
                    opacity: 1;
                }
                .code-block--locked .resize-handle,
                .code-block[data-expanded="true"] .resize-handle {
                    display: none !important;
                }
                .protyle-icon--expand, .protyle-icon--preview, .protyle-icon--lock {
                    color: var(--b3-theme-on-background);
                    background-color: var(--b3-list-hover);
                    transition: opacity 150ms ease, transform 150ms ease;
                }
                .protyle-icon--expand:hover, .protyle-icon--preview:hover, .protyle-icon--lock:hover {
                    opacity: 0.86;
                    transform: scale(1.1);
                }
                .code-block--locked .hljs {
                    cursor: text;
                }
                .code-block--locked .protyle-icon--lock {
                    color: var(--b3-theme-primary);
                }
                #modal-preview {
                    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: var(--b3-mask-background); 
                    z-index: 9999; 
                }
                #modal-preview-content {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background-color: var(--b3-theme-background); padding: 20px; 
                    width: 80%; height: 80%; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); 
                    border-radius: 5px;
                }
                #modal-preview-close { 
                    position: absolute; top: 10px; right: 10px; cursor: pointer; 
                    font-size: 14px; color: var(--b3-theme-on-background);
                    transition: transform 0.2s;
                }
                #modal-preview-close:hover {
                    transform: scale(1.2);
                }
                #modal-preview-iframe { width: 100%; height: calc(100% - 20px); border: none; }
            `);
            ModalManager.initialize();
            const layoutCenter = await whenElementExist(SELECTORS.layoutCenter);
            const protyle = await whenElementExist(() => {
                const p = layoutCenter.querySelector(SELECTORS.protyle);
                return p?.dataset?.loading === "finished" ? p : null;
            });
            const codeBlocks = protyle.querySelectorAll(
                SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
            );
            await addCodeExtends(codeBlocks, protyle);
            // 滚动监听
            const throttledAddCodeExtends = throttle(() => {
                const newCodeBlocks = protyle.querySelectorAll(
                    SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
                );
                addCodeExtends(newCodeBlocks, protyle);
            }, CONFIG.throttleDelay);
            const protyleContent = protyle.querySelector(SELECTORS.protyleContent);
            if (protyleContent) {
                protyleContent.addEventListener("scroll", throttledAddCodeExtends, {
                    passive: true,
                });
            }
            // 观察新的Protyle加载
            observeProtyleLoaded(layoutCenter, async (protyles) => {
                for (const p of protyles) {
                    const actualProtyle = p.classList.contains("protyle")
                        ? p
                        : p.closest(SELECTORS.protyle);
                    if (!actualProtyle) continue;
                    const newCodeBlocks = actualProtyle.querySelectorAll(
                        SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
                    );
                    await addCodeExtends(newCodeBlocks, actualProtyle);
                    const throttledHandler = throttle(() => {
                        const additionalCodeBlocks = actualProtyle.querySelectorAll(
                            SELECTORS.codeBlock + ":not(:has(.protyle-icon--expand))"
                        );
                        addCodeExtends(additionalCodeBlocks, actualProtyle);
                    }, CONFIG.throttleDelay);
                    const content = actualProtyle.querySelector(SELECTORS.protyleContent);
                    if (content) {
                        content.addEventListener("scroll", throttledHandler, {
                            passive: true,
                        });
                    }
                }
            });
        } catch (error) {
            console.error("代码块扩展初始化失败:", error);
        }
    }
    // 启动初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();

```
