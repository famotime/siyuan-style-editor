# [css][js] 思源笔记代码片段收集

---

- [css][js] 思源笔记代码片段收集 - 链滴
- [https://ld246.com/article/1770345069860](https://ld246.com/article/1770345069860)
- - 【思源笔记】思源笔记代码片段收集 - 慕雪的寒舍 - [https://blog.musnow.top/posts/612440692/index.html](https://blog.musnow.top/posts/612440692/index.html) - 在论坛上收集的有效的思源代码片段 - 2026-
- 2026-02-06 19:57

---

这里是慕雪的小助手，这篇文章介绍了思源笔记v3.1.3版本中三个实用的代码片段，包括CSS实现表格宽度自适应、代码块MAC样式美化以及多级列表子弹线。第一个代码片段通过CSS使表格自动换行并自适应宽度，第二个代码片段通过CSS将代码块美化为MAC样式，提高可读性和美观度，第三个代码片段结合CSS和JS实现多级列表的子弹线效果，增强列表的可视性。这些代码片段能够提升思源笔记的使用体验，使用户界面更加友好。

‍

在论坛上收集的有效的思源代码片段，思源笔记版本v3.1.3。

在思源笔记`设置-外观-代码片段`中添加CSS或者JS代码片段并启用即可。

## **1. CSS.表格宽度自适应**

使用如下代码块可以让表格自适应宽度（自动换行）

来源: [https://ld246.com/article/1726116689636/comment/1726126776087#comments](https://ld246.com/article/1726116689636/comment/1726126776087#comments)；

```css
/* 表格宽度自适应 */
.b3-typography table, .protyle-wysiwyg table {
    width: 100%;
        display: table;
}
```

添加前，表格超长后需要滚动才能看到后续内容

![image.png](assets/2169a3e87f8300792804cbc39588f11a-20260206101410-bcp0lwe.png)

添加后，宽度自适应，无需滚动

![image.png](assets/9b39e59e95015fb7b581b320ca430f14-20260206101410-ebbk8j1.png)

## **2. CSS.代码块MAC美化**

默认情况下思源的代码块和其他块的差距没有那么明显，这里给出CSS片段，可以在不安装代码块美化插件的情况下直接让你的代码块变成MAC样式。

来源：[https://ld246.com/article/1715315635131](https://ld246.com/article/1715315635131)；

```css
pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em
}

code.hljs {
    padding: 3px 5px
}

.hljs-comment,
.hljs-quote {
    color: #969896
}

.hljs-deletion,
.hljs-name,
.hljs-regexp,
.hljs-selector-class,
.hljs-selector-id,
.hljs-tag,
.hljs-template-variable,
.hljs-variable {
    color: #d54e53
}

.hljs-built_in,
.hljs-link,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-params,
.hljs-type {
    color: #e78c45
}

.hljs-attribute {
    color: #e7c547
}

.hljs-addition,
.hljs-bullet,
.hljs-string,
.hljs-symbol {
    color: #b9ca4a
}

.hljs-section,
.hljs-title {
    color: #7aa6da
}

.hljs-keyword,
.hljs-selector-tag {
    color: #c397d8
}

.hljs {
    background: #282828; /* 如果是3.1.5需要把这个改成 #000 */
    color: #eaeaea
}

.hljs-emphasis {
    font-style: italic
}

.hljs-strong {
    font-weight: 700
}

/* 代码块背景设置 */
.b3-typography .code-block:not(pre), .protyle-wysiwyg .code-block:not(pre) {
    padding: 2em 1em 1.6em;
    margin: 1em 0;
    box-sizing: border-box;
    background-color: #282828;
}

.code-block::after {
    content: ' ';
    position: absolute;
    background: #fa625c;
    box-shadow: 23px 0 #fdbc40, 45px 0 #35cd4b;
    border-radius: var(--b3-border-radius-round);
    top: 10px;
    left: 15px;
    height: 12px;
    width: 12px;
    z-index: 1;
    border-radius: 6px;
}


.b3-typography .code-block:not(pre) .protyle-action .protyle-action__language, .protyle-wysiwyg .code-block:not(pre) .protyle-action .protyle-action__language {
    font-size: 85%;
    color: #fff8ed;
    margin-top: 0px;
    align-self: center;
    margin-left: 75px;
}

.code-block .protyle-action .protyle-action__copy, .code-block .protyle-action .protyle-action__menu {
    margin-top: 0px;
    color: #fff;
    background-color: var(--S-list-background);
}
```

这里改用官方的默认黑色主题midnight来测试，修改前，代码块和其他部分区分度纯靠颜色，而且字体离代码块边缘太近了。

![image.png](assets/6ef82fdbac1db7b705a676ae1db1e1b1-20260206101410-nh48uje.png)

修改后，顿时好看多了。

![image.png](assets/f3ce2aea89979e6f6031be99bf3f5f64-20260206101410-t0hofnr.png)

## **3. CSS+JS.多级列表子弹线**

来源: [https://ld246.com/article/1693238082034](https://ld246.com/article/1693238082034);

css片段

```css
/* REF https://github.com/svchord/Rem-Craft */
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.protyle-action{
    color:rgb(70, 110, 220);;
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.protyle-action svg{
    margin:0;
    width:16px;
    height:16px;
    padding:0px 0px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li::after{
    content:"";
    display:block;
    position:absolute;
    pointer-events:none;
    width:34px;
    left:-18px;
    top:-20px;
    border-style:solid;
    border-color:rgb(70, 110, 220);;
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li:not(:has(.block-focus))::after{
    bottom:-2px;
    border-width:0 0 0 2px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li:has(.block-focus)::after{
    height:38px;
    border-radius:0 0 0 8px;
    border-width:0 0 2px 2px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li:has(.block-focus)~.li:not(:has(.block-focus))::after{
    border-color:rgba(0,0,0,0)
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li[data-subtype=o]::after{
    width:24px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>.list:has(.block-focus)>.li[data-subtype=t]::after{
    width:28px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id]::after{
    content:"";
    display:block;
    position:absolute;
    pointer-events:none;
    width:34px;
    left:-18px;
    top:-20px;
    border-style:solid;
    border-color:rgb(70, 110, 220);
    top:20px;
    height:calc(100% + 4px);
    border-width:0 0 0 2px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id]:has(+.list)::after{
    height:auto;
    bottom:0
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id][data-type=NodeHeading]::after{
    top:0;
    height:185%
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].list:has(.block-focus)::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].list:has(.block-focus)~[data-node-id]::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].bq:has(.block-focus)::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].bq:has(.block-focus)~[data-node-id]::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].sb:has(.block-focus)::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus)>[data-node-id].sb:has(.block-focus)~[data-node-id]::after{
    border-color:rgba(0,0,0,0)
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[fold="1"]>[data-node-id]::after,.protyle-wysiwyg [data-node-id].li:has(.block-focus):has(>.block-focus)>[data-node-id]::after{
    border-color:rgba(0,0,0,0)
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=o]:has(.block-focus)>.list:has(.block-focus)>.li::after{
    top:-10px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=o]:has(.block-focus)>.list:has(.block-focus)>.li:has(.block-focus)::after{
    height:28px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=t]:has(.block-focus)>.protyle-action{
    color:rgb(70, 110, 220); /* 子弹线颜色修改这里 */ 
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=t]:has(.block-focus)>.protyle-action svg{
    margin:0;
    width:14px;
    height:14px;
    padding:0px 0px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=t]:has(.block-focus)>.list:has(.block-focus)>.li::after{
    top:-14px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=t]:has(.block-focus)>.list:has(.block-focus)>.li:has(.block-focus)::after{
    height:32px
}
.protyle-wysiwyg [data-node-id].li:has(.block-focus)[data-subtype=t]:has(.block-focus).protyle-task--done>.list:has(.block-focus)>.li::after{
    border-color:rgba(139, 139, 139)
}
```

js片段

```js
// 缓存编辑器块并处理聚焦状态的函数定义
let cachedEditorBlocks = []; // 缓存所有编辑器块
let focusedBlock = null; // 缓存当前聚焦的块

// 初始化缓存
function initEditorBlocksCache() {
    const editors = document.querySelectorAll('.protyle-wysiwyg');
    editors.forEach(editor => {
        if (!editor.classList.contains('NodeAttributeView')) {
            cachedEditorBlocks.push(...editor.querySelectorAll('[data-node-id]'));
        }
    });
}

// 更新聚焦状态并维护缓存
function handleBlockFocus(e) {
    let target;
    if (e.type === 'mouseup') {
        // 鼠标事件，查找最近的具有data-node-id属性的元素
        target = e.target.closest('[data-node-id]');
    } else if (e.type === 'keyup') {
        // 键盘事件，查找当前焦点所在的具有data-node-id属性的元素
        const activeElement = document.activeElement;
        if (activeElement.classList.contains('protyle-wysiwyg')) {
            target = window.getSelection()?.focusNode?.parentElement;
            while (target && !target.dataset.nodeId) {
                target = target.parentElement;
                if (!target) break; // 避免空指针异常
                if (target.classList.contains('NodeAttributeView')) {
                    target = null; // 如果找到NodeAttributeView，则不处理该元素
                    break;
                }
            }
        }
    }

    if (!target || target === focusedBlock) return;

    if (focusedBlock) {
        focusedBlock.classList.remove('block-focus');
    }
    focusedBlock = target;
    focusedBlock.classList.add('block-focus');

    // 根据需要调用相关功能，例如：
    // setSelector(focusedBlock);
}

// 初始化编辑器块缓存
initEditorBlocksCache();

// 绑定事件监听器
document.addEventListener('mouseup', handleBlockFocus, true);
document.addEventListener('keyup', handleBlockFocus, true);

// 立即调用的异步函数表达式，执行handleBlockFocus并输出日志
(async () => {
    // 这里我们调用handleBlockFocus函数，但由于它不返回Promise，所以不需要await
    handleBlockFocus({ type: 'dummy' }); // 模拟事件调用
    console.log('Bullet line init success.');
})();
```

添加以后，在点击多级列表的时候，会出现蓝色子弹线

![image.png](assets/41ae6bdf77a6165699c9d7ffb13e5de8-20260206101410-epsdcea.png)

## **4. CSS.给标签添加井号**

默认的文内标签和文章标题标签都没有井号，看起来多少有点奇怪（特别是文内标签），可以用如下代码块来处理一下

来源：[https://ld246.com/article/1725865228744](https://ld246.com/article/1725865228744)

```css
/* 标题 标签 */
.b3-chip--secondary, .b3-chip--primary, .b3-chip--info, .b3-chip--success, .b3-chip--warning, 
.b3-chip--warning, .b3-chip--error, .b3-chip--pink {
    mix-blend-mode: normal !important;
}

.b3-chip--secondary::before, .b3-chip--primary::before, .b3-chip--info::before, .b3-chip--success::before, .b3-chip--warning::before, .b3-chip--warning::before, .b3-chip--error::before, .b3-chip--pink::before {
    content: "#" !important;
    margin-right: 5px;  /* # 号距离文字的距离 */
}

.protyle-background .b3-chip--secondary {
    color: #fff !important;
    background-color:  #d6ff0070 !important;
}
.protyle-background .b3-chip--primary {
    color: #fff !important;
    background-color: #0053f9c4 !important;
}
.protyle-background .b3-chip--info {
    color: var(--b3-card-info-color) !important;
    background-color: #28405c !important;
}
.protyle-background .b3-chip--success {
    color: var(--b3-card-success-color) !important;
    background-color: #425347 !important;
}
.protyle-background .b3-chip--warning {
    color: var(--b3-card-warning-color) !important;
    background-color: #554636 !important;
}
.protyle-background .b3-chip--error {
    color: var(--b3-card-error-color) !important;
    background-color: #442724 !important;
}
.protyle-background .b3-chip--pink {
    color: var(--b3-theme-on-secondary) !important;
    background-color: #ea4aaa96 !important;
}
```

```css
/* 行内标签 */
.protyle-wysiwyg [data-node-id] span[data-type~=tag] {
    --tag-color: #97B9DA;
    font-size: 80%;
    border-radius: 1em;
    padding: .1em .5em .15em;
    border: none;
    box-shadow: 0 0 0 .065em inset var(--tag-color);
    background-color: #28405c !important;
    color: var(--tag-color) ;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
}

.protyle-wysiwyg [data-node-id] span[data-type~=tag]::before {
    content: "#" !important;
    margin-right: 5px;  /* # 号距离文字的距离 */
}
```

修改前，行内标签那是完全看不出来

![image.png](assets/7804f4178591a505ec9d4072043e356e-20260206101410-ge7ie4x.png)

修改后，行内标签正常多了

![image.png](assets/35c2f43414ed7ec4846d0068c0c5af62-20260206101410-7mrf3rp.png)

下图是标题标签修改后的效果。

![image.png](assets/b595c9f6d1eb296d379880b5c4feb3e5-20260206101410-osndrkl.png)

这一点我觉得是思源本身默认主题的前端设置就有问题，就算没有井号，行内标签也不能是毫无辨识度的背景色，那样在使用的时候体验真的不行。

备注：行内标签需要在思源`设置-编辑器`最底部开启该选项才可使用。

![image.png](assets/9731aba0c45a1073cf2263035e6dafcf-20260206101410-z23e62f.png)

## **5. CSS.分割线加粗**

这一个真的非常需要，默认暗色主题的分割线实在是看不出来！！

来源：[https://ld246.com/article/1700551933609](https://ld246.com/article/1700551933609);

```css
/* 更改分割线样式 CSS片段 */
.hr {
  border: none;
  position: relative;
}

.hr::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px; /* 粗细 */
  background-color: white; /* 颜色 */
  transform: translateY(-50%);
}
```

修改前

![image.png](assets/e68998e941f1653f8f91cbcf313df870-20260206101410-aaqc5go.png)

修改后

![image.png](assets/de310946863d053de10b25dc2523ddbd-20260206101410-6c3ax7m.png)

部分主题对分割线的样式进行了重置，无需使用该代码片段。

## **6. CSS.自定义荧光笔颜色**

如题，自定义荧光笔标记的颜色。

这里的颜色是RGB的十六进制码，随便百度一个RGB颜色网站就能选你想要的颜色和对应的十六进制码了。

```css
/* 自定义标记颜色 CSS片段 */
:root{
--b3-protyle-inline-mark-background: #F9FC093B;
}
```

来源：[https://ld246.com/article/1700551933609#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A0%87%E8%AE%B0%E9%A2%9C%E8%89%B2-CSS%E7%89%87%E6%AE%B5](https://ld246.com/article/1700551933609#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A0%87%E8%AE%B0%E9%A2%9C%E8%89%B2-CSS%E7%89%87%E6%AE%B5)

## **7. CSS.外观菜单字体变粗**

默认情况下思源的外观菜单（就是选字体颜色的哪一个）看不清，可以处理一下

来源：[https://ld246.com/article/1702095793605/comment/1702105185880?r=a2930610542#comments](https://ld246.com/article/1702095793605/comment/1702105185880?r=a2930610542#comments)

```css
.protyle-util .color__square[data-type="color"]{font-weight:bold}
```

![image.png](assets/2c3dbeaf4edf05a817c3546409e48ae0-20260206101410-3v1md84.png)

不过，这种类markdown的编辑器，个人始终不建议修改文字的颜色和大小（特别是修改大小）。因为markdown本身生出来就是想让你别考虑排版的，有些人写的博客里面大大小小的字都有，原本作者是想突出一些重点，但是看上去是真不舒服，反而劣化了读者体验。

编辑markdown应该通过文字加粗、引用块、斜体、行内代码块来实现不同文字的强调或弱化，而不是用文字大小或者文字颜色来处理！这一观点嵌入到了我编辑markdown的基本思路中，所以本站的文章你是很难看到有什么特殊的字体颜色的（除了少数特别特别严重的说明我会用红色来标注）。

以上为个人想法，不适用于所有人，欢迎讨论。

## **8. JS.自定义默认代码语言和代码块语言选择置顶项**

默认情况下，思源笔记的代码块会采用上一次用过的语言。但我编写笔记的很多时候，会在语言和这个语言于Linux控制台输出之间不断切换。而Linux的控制台输出如果也使用Linux命令行的bash语言，就会得到一大堆没有作用的无效高亮。

所以在论坛中找到了这个js片段，可以自定义代码块的默认语言，以及把自己最常用的语言置顶。

来源：[https://ld246.com/article/1723089690687](https://ld246.com/article/1723089690687);

```js
// 功能：代码块最近使用的语言置顶
(async ()=>{
    // 配置默认的代码语言，注意如果设置了这个参数，则会覆盖上一次使用的语言。始终默认用这个语言，为空不设置
    const defaultCodeLang = "";

    // 配置最近代码语言最大显示个数
    const recentlyCodeLangLength = 10;

    // 配置置顶的代码语言，这个配置里的语言始终置顶，比如 ["js", "java", "php"]
    let topCodeLang = [];

    // 配置持久化文件的存储路径
    const storagePath = "/data/storage/recently_code_lang.json";

    /////////////////// 以下数据不涉及配置项，如无必要请勿修改 /////////////////////////////

    // 获取最近使用的语言
    let recentlyCodeLang = await getFile(storagePath);
    // 置顶语言倒序
    topCodeLang.reverse();
    // 布局完成时执行
    let codeTimer = null;
    whenElementExist(".layout__center").then((element)=>{
        const layoutCenter = element;
        const observer = observeDomChange(layoutCenter, (mutation) => {
            // 监听弹窗代码列表
            if(mutation.target.classList.contains("protyle-util")) {
                const codeList = mutation.target.querySelector(".b3-list--background");
                if(codeList){
                    const firstChild = codeList.firstElementChild;
                    sortLangList([...recentlyCodeLang, ...topCodeLang], codeList, firstChild);
                    // console.log(codeList, 'codeList');
                }
            }
            // 监听代码被选择
            if(mutation.target.classList.contains("code-block") || mutation.target.classList.contains("hljs")) {
                if(codeTimer) clearTimeout(codeTimer);
                codeTimer = setTimeout(() => {
                    const codeBlock = mutation.target.closest(".code-block");
                    const langText = codeBlock?.querySelector(".protyle-action__language")?.textContent;
                    // 添加语言
                    addLanguage(langText);
                    // 设置默认语言
                    setDefaultLang();
                    // console.log(mutation.target.querySelector(".protyle-action__language")?.textContent, 'selected');
                }, 40);
            }
        });
        // 为了体验一致性，第一次使用时加载一次上次使用的语言
        addLanguage(getLastLang());
        // 设置默认语言
        setDefaultLang();
        // 调试时使用
        // window.obsv=observer
    });

    // 排序语言，主要把置顶的语言移动上去
    function sortLangList(topCodeLang, listContainer, clearItem) {
        topCodeLang.forEach(lang => {
            // 查找对应的.b3-list-item元素
            const item = Array.from(listContainer.querySelectorAll('.b3-list-item')).find(item => item.textContent.trim() === lang);
            if (item) {
                // 将找到的元素移动到 "清空" 元素之后
                listContainer.insertBefore(item, clearItem.nextSibling);
            } else {
                // 如果不存在则创建一个新的元素
                const newElement = document.createElement('div');
                newElement.className = 'b3-list-item';
                newElement.textContent = lang;
                listContainer.insertBefore(newElement, clearItem.nextSibling);
            }
        });
        // 移动焦点到第一个子元素
        listContainer.querySelector(".b3-list-item--focus").classList.remove("b3-list-item--focus");
        listContainer.children[1].classList.add("b3-list-item--focus");
    }

    // 添加语言，长度始终保持在recentlyCodeLangLength之内
    async function addLanguage(language) {
        if(!language) return;

        // 传入的language参数仅供参考，真正获取最后一次使用的语言得从思源存储中或数据库查询中获取，
        // 这样可以防止块元素被意外触发，添加非最后一次使用的语言，导致混乱
        // 这样无论哪个代码块被触发都以getLastLang为准
        language = getLastLang();

        if(!language) return;

        // 如果最后一个元素已经是上次使用的语言，则不再重复添加
        if(recentlyCodeLang[recentlyCodeLang.length-1] === language) {
            return;
        }

        // 检查数组中是否已经有相同的元素
        const index = recentlyCodeLang.indexOf(language);
        if (index !== -1) {
            // 如果存在，则移除这个元素
            recentlyCodeLang.splice(index, 1);
        }

        // 添加新语言到数组
        recentlyCodeLang.push(language);

        // 检查数组长度，如果超过最大长度，则删除最前面的元素
        while (recentlyCodeLang.length > recentlyCodeLangLength) {
            recentlyCodeLang.shift(); // 删除数组的第一个元素
        }

        // 存储数据
        putFile(storagePath, recentlyCodeLang);
    }

    // 设置设置默认语言
    function setDefaultLang() {
        if(defaultCodeLang) window.siyuan.storage["local-codelang"] = defaultCodeLang;
    }

    // 获取上次使用的语言
    function getLastLang() {
        // 从思源存储获取
        return window.siyuan.storage["local-codelang"];
        // 从数据库获取，暂未用到
        // return await getLastLangFromDb();
    }

    // 从数据库获取最近使用的语言，暂未用到
    async function getLastLangFromDb() {
        const sql = `SELECT markdown FROM blocks WHERE type = 'c'  ORDER  by updated DESC limit 1`;
        const result = await fetchSyncPost('/api/query/sql', {"stmt": sql});
        if(result.data[0]?.markdown){
            return result.data[0].markdown.split("\n")[0].replace('‍```', '');
        }
        return "";
    }

    // 获取最近使用的语言持久数据
    async function getFile(storagePath) {
        if(!storagePath) return [];
        const data = await fetchSyncPost('/api/file/getFile', {"path":`${storagePath}`});
        if(data.code && data.code !== 0) return [];
        return data;
    }

    // 存入数据到文件
    function putFile(storagePath, data) {
        const formData = new FormData();
        formData.append("path", storagePath);
        formData.append("file", new Blob([JSON.stringify(data)]));
        return fetch("/api/file/putFile", {
            method: "POST",
            body: formData,
        }).then((response) => {
            if (response.ok) {
                //console.log("File saved successfully");
            }
            else {
                throw new Error("Failed to save file");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    // 请求api
    async function fetchSyncPost (url, data) {
        const init = {
            method: "POST",
        };
        if (data) {
            if (data instanceof FormData) {
                init.body = data;
            } else {
                init.body = JSON.stringify(data);
            }
        }
        try {
            const res = await fetch(url, init);
            const res2 = await res.json();
            return res2;
        } catch(e) {
            console.log(e)
            return [];
        }
    }

    // 监控dom变化
    function observeDomChange(targetNode, callback) {
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    callback(mutation);
                }
            }
        });
        observer.observe(targetNode, config);
        // 返回observer，用于停止观察
        // observer.disconnect();
        return observer;
    }

    // 等待元素渲染完成后执行
    function whenElementExist(selector) {
        return new Promise(resolve => {
            const checkForElement = () => {
                let element = null;
                if (typeof selector === 'function') {
                    element = selector();
                } else {
                    element = document.querySelector(selector);
                }
                if (element) {
                    resolve(element);
                } else {
                    requestAnimationFrame(checkForElement);
                }
            };
            checkForElement();
        });
    }
})();
```

如下图所示，默认情况下，代码块会是plaintext。

```js
// 配置默认的代码语言，注意如果设置了这个参数，则会覆盖上一次使用的语言。始终默认用这个语言，为空不设置
const defaultCodeLang = "plaintext";
```

![image.png](assets/8008447f4cda669469139956d91fa31e-20260206101410-1sevq6j.png)

这里我设置了几个置顶的代码语言，也成功被置顶了，方便选择。

```js
// 配置置顶的代码语言，这个配置里的语言始终置顶，比如 ["js", "java", "php"]
let topCodeLang = ["cpp","bash","python","json","xml"];
```

![image.png](assets/fe7ab06922aa71fbdd989e86f3987f79-20260206101410-6n078pw.png)

这个插件会在思源工作空间的`/data/storage/recently_code_lang.json`进行最近使用代码块语言的次数记录。如果你想重置数据记录，删除这个json文件即可。

## **9. CSS.配置emoji**

在win10的电脑上可能会出现大量emoji缺失和不规整的问题，建议使用twemoji来替换思源笔记里面的emoji。替换emoji不一定需要安装插件，用下面的css也能实现。

> [twitter/twemoji](https://github.com/twitter/twemoji)是twitter在github开源的免费emoji，采用MIT协议。

这里的url路径是思源工作空间下的data中的路径，即工作空间data中的plugins文件夹，把下载的ttf文件放到这个路径下就可以了。

```css
/* [0] */

@font-face {
    font-family: 'Twitter Emoji';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("/plugins/Twemoji.Mozilla.ttf");
}

:root {
    --b3-font-family-emoji: 'Twitter Emoji', sans-serif !important;
    --b3-font-family-code: "JetBrainsMono-Regular", mononoki, Consolas, "Liberation Mono", Menlo, Courier, monospace, 'Twitter Emoji', "Apple Color Emoji", "Segoe UI Emoji", "Twitter Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols" !important;
    --b3-font-family: "Helvetica Neue", "Luxi Sans", "DejaVu Sans", "Hiragino Sans GB", "Microsoft Yahei", sans-serif, 'Twitter Emoji', "Apple Color Emoji", "Segoe UI Emoji", "Twitter Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols" !important;
}
```

您可以在本站下载该tff文件：[下载地址](https://blog.musnow.top/img/data/Twemoji.Mozilla.ttf)。

## **10. CSS.标题改色**

修改各个等级标题的颜色，让标题的层级更加突出。

来源：[https://ld246.com/article/1726590722601/comment/1726592372747#comments](https://ld246.com/article/1726590722601/comment/1726592372747#comments)

```css
.protyle-wysiwyg .h1 { color: #d40045; }
.protyle-wysiwyg .h2 { color: #ff7f00; }
.protyle-wysiwyg .h3 { color: #66b82b; }
.protyle-wysiwyg .h4 { color: #093f86; }
.protyle-wysiwyg .h5 { color: #340c81; }
```

## **11. CSS.字体渲染优化**

windows默认的字体渲染有一些问题，使用下面的CSS能一定程度上优化字体的渲染。修改font-family修改为你喜欢的中文字体即可。

来源：[https://ld246.com/article/1712480500457](https://ld246.com/article/1712480500457)

```css
**:not(.katex):not(.overlaydiv):not([class*="icon"]):not([class*="button"]){
 /*使字体渲染不会应用于部分特殊字符符号和图标以及按钮等网页元素*/

    font-family: "黑体" !important; /*字体设置,中文字体安装对应字体后可选：苹方黑体、微软雅黑、pingfang sc regular、PingFang SC Heavy、.萍方-简、思源黑体 CN*/

    text-shadow: 0.01em 0.01em 0.01em #999999 ;  /*更改字体阴影及颜色,可修改数值实现不同的效果*/
    -webkit-text-stroke-width: 0.50px; /*更改字体描边粗细*/
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}

 /*使字体渲染不会应用于公式和图片制卡*/
span:not([class="katex"]) :not([class="overlaydiv"]){
    text-shadow: 0.01em 0.01em 0.01em rgba(0,0,0,0) !important;  
}

/*使字体渲染不会应用于PDF浏览*/
.textLayer span
{
    text-shadow: 0.01em 0.01em 0.01em rgba(0,0,0,0) !important;  
}

 /*使字体渲染不会应用于加粗字体*/
.b3-typography strong, .b3-typography span[data-type~=strong], .protyle-wysiwyg strong, .protyle-wysiwyg span[data-type~=strong] {
    text-shadow: 0.01em 0.01em 0.01em #999999 !important;  
    -webkit-text-stroke-width: 0px !important;
}
```

评论区还有另外一个代码片段。

```css
:not(.katex):not(.overlaydiv):not([class*="icon"]):not([class*="button"]){
 /*使字体渲染不会应用于部分特殊字符符号和图标以及按钮等网页元素*/

    font-family: "仓耳云黑 W04" !important; /*字体设置,中文字体安装对应字体后可选：苹方黑体、微软雅黑、pingfang sc regular、PingFang SC Heavy、.萍方-简、思源黑体 CN*/

    text-shadow: 0 0 0.36px #7C7C7CDD ;  /*更改字体阴影及颜色,可修改数值实现不同的效果*/
    -webkit-text-stroke-width: 0.08px; /*更改字体描边粗细*/
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}

 /*使字体渲染不会应用于公式和图片制卡*/
span:not([class="katex"]) :not([class="overlaydiv"]){
    text-shadow: 0.01em 0.01em 0.01em rgba(0,0,0,0) !important;  
}

 /*使字体渲染不会应用于加粗字体*/
.b3-typography strong, .b3-typography span[data-type~=strong], .protyle-wysiwyg strong, .protyle-wysiwyg span[data-type~=strong] {
    text-shadow: 0.01em 0.01em 0.01em #999999 !important;  
    -webkit-text-stroke-width: 0px !important;
}
```

在3.1.5上实测会出现严重重影，不确定是不是参数差异导致的。暂时不推荐使用。

## **12. JS顶栏倒计时**

在思源的顶栏显示一个目标日期的倒计时

![image.png](assets/1bf7231da6c2902c6a64519567759cc2-20260206101410-bx1ci4o.png)

来源：[https://ld246.com/article/1726411686880](https://ld246.com/article/1726411686880)；

```js
// 顶栏倒计时，JS片段 https://ld246.com/article/1726411686880

// 设置文本内容和目标日期
const countdownMessage = "距离 2025 年高考剩余 ${daysLeft} 天";
const targetDateString = '2025-6-7';

// -------------------- 下面的内容不要修改 --------------------
const targetDate = new Date(targetDateString);

function startCountdown(targetDate) {
  // 计算剩余天数的函数
  function calculateDaysLeft() {
    let currentDate = new Date();
    let differenceInTime = targetDate.getTime() - currentDate.getTime();
    let daysLeft = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // 将时间差转换为天数
    return daysLeft;
  }

  // 更新倒计时显示
  function updateCountdown() {
    let daysLeft = calculateDaysLeft();
    let countdownElement = document.getElementById("countdown_days_display");
    if (countdownElement) {
      countdownElement.innerText = countdownMessage.replace('${daysLeft}', daysLeft);
    } else {
      console.warn("找不到 countdown_days_display 元素");
    }
  }

  // 首次插入倒计时显示元素到 #toolbar > #drag 元素旁边
  function insertCountdownElement() {
    let toolbarDrag = document.querySelector('#toolbar > #drag');
    if (toolbarDrag) {
      toolbarDrag.insertAdjacentHTML(
        "afterend",
        `<div id="countdown_days_display" style="font-size: 12px; color: var(--b3-toolbar-color); margin-right: 14px; user-select:none;"></div>`
      );
      updateCountdown(); // 插入后立即更新显示
    } else {
      console.error("找不到 #toolbar > #drag 元素");
    }
  }

  // 每隔1分钟检测倒计时元素是否存在
  let checkInterval = setInterval(() => {
    let countdownElement = document.getElementById("countdown_days_display");

    // 如果倒计时元素不存在，则重新插入
    if (!countdownElement) {
      insertCountdownElement();
      console.log("倒计时元素不存在，重新插入");
    } else {
      console.log("倒计时元素已存在，停止检测");
      clearInterval(checkInterval);  // 如果找到了元素，停止检测
    }
  }, 60 * 1000); // 每1分钟检测一次

  // 立即插入倒计时显示元素，并在1分钟后开始定时更新
  insertCountdownElement(); // 立即插入元素
  setInterval(updateCountdown, 60 * 1000); // 每60秒更新一次（1分钟）
}

// 启动倒计时功能
startCountdown(targetDate);
```

## **13. CSS.代码块折叠后依旧显示备注**

默认情况下代码块折叠了之后，右上角的小m图标会消失，无法显示备注。使用如下代码块可以让代码块被折叠了之后依旧能显示右上角的小m图标。

来源：[https://ld246.com/article/1724828789124](https://ld246.com/article/1724828789124)

```css
.protyle-wysiwyg [data-node-id][fold="1"]:not(.li):not([data-type=NodeHeading]){
    opacity:1;
}
.protyle-wysiwyg [data-node-id][fold="1"]:not(.li):not([data-type=NodeHeading]) .protyle-attr {
    opacity: 1;
    top: 0px;
}
```

## **14. CSS.图片居中**

默认情况下思源图片不是居中的。对于我来说我用不上图文混排的功能，基本上只会插入一张图片，所以直接让图片默认居中吧。

来源：[https://ld246.com/article/1700551933609](https://ld246.com/article/1700551933609)

```css
/* 图片居中 CSS片段 */
.p:has(span.img) { 
    text-align:center;
}
```

## **15. CSS.文件后缀图标**

思源内有部分文件后缀是没有图标的，所以需要手动配置一下。图标文件的url以思源工作空间下conf目录为根目录。使用该代码片段，需要同时修改所有后缀名，并指向正确的图标文件路径。

来源：[https://ld246.com/article/1725863880770/comment/1725878511726#comments](https://ld246.com/article/1725863880770/comment/1725878511726#comments)

```css
/* Java 文件 */
#sidebar [data-type="sidebar-outline"] [data-node-id] span[data-type~=a][data-href$=".java"]::before,
.sy__outline [data-node-id] span[data-type~=a][data-href$=".java"]::before,
.protyle-wysiwyg [data-node-id] span[data-type~=a][data-href$=".java"]::before,
#sidebar [data-type="sidebar-outline"] [data-node-id] span[data-type~=url][data-href$=".java"]::before,
.sy__outline [data-node-id] span[data-type~=url][data-href$=".java"]::before,
.protyle-wysiwyg [data-node-id] span[data-type~=url][data-href$=".java"]::before {
    background-image: url(/appearance/myicon/java.svg) !important;
}
.protyle-wysiwyg a[href$=".java"]::before,
.b3-typography a[href$=".java"]::before {
    background-image: url(/appearance/myicon/java.svg) !important;
}
```

## **16. JS.日记按钮顶栏注册**

3.1.3版本（其实很早之前就改版了）默认情况下日记按钮需要点击左上角工作空间才会在下拉菜单里面弹出，虽然它支持`ALT+5`快捷键，但是对于我个人来说更习惯于用按钮的方式来呼出日记，所以就找了找是否有把日记按钮注册到顶栏的代码片段。

来源：[https://ld246.com/article/1674026309504](https://ld246.com/article/1674026309504)；

使用方式就是添加如下js代码块，并把你需要注册到顶栏的按钮设置为true，不需要的按钮设置为false即可。添加了这个js代码块后就能在顶栏点击日记按钮了。

第一次点击的时候会让你选择一个笔记本，选择了之后，后续点击就会直接在刚刚选择过的笔记本里面创建日记文件了。

![image.png](assets/d70b8b7ce27d12b983816e8633615c3f-20260206101410-57qdnal.png)

```js
/**
 * addBarButton.js
 * v0.5（代码片段模式） 本次更新：加入代码片段按钮；
 * 为顶栏增加数据历史、日记、闪卡按钮，点击后创建对应功能快捷键按下事件
 * 挂件模式支持点击日记列出笔记本。 https://ld246.com/article/1674026309504
 */

// 设置是否添加对应按钮
let g_addDailyNote = true;  // 日记
let g_addFlashCard = true;  // 闪卡
let g_addSetting = true;    // 设置
let g_addHistory = true;    // 数据历史
let g_addRecentDocs = true; // 最近打开的文档// TODO: ipad上没用？
let g_addSnippets = true;   // 代码片段


// ===================== 这下面的内容都不要修改 =====================
let g_addSnippetInterval = null;

// 插入按钮
// 插入日历笔记本选择挂件 
// 参考: https://ld246.com/article/1662969146166  原作者: BryceAndJuly
// 参考: https://github.com/svchord/Rem-Craft 原作者: Seven Chor
function addDailyNote() {
  let barSync = document.getElementById("barSync");
  barSync.insertAdjacentHTML(
    "afterEnd",
    '<div id="barDailyNote_simulate" class="toolbar__item ariaLabel" aria-label="日记/DailyNote" ></div>'
  );
  let dailyNoteBtn = document.getElementById("barDailyNote_simulate");
  dailyNoteBtn.innerHTML = `<svg><use xlink:href="#iconCalendar"></use></svg>`;

  dailyNoteBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("dailyNote")
    },
    false
  );

}
function addFlashCard() {
  let barSync = document.getElementById("barSync");
  barSync.insertAdjacentHTML(
    "afterEnd",
    '<div id="barFlashCard_simulate" class="toolbar__item ariaLabel" aria-label="闪卡/FlashCards" ></div>'
  );
  let flashCardBtn = document.getElementById("barFlashCard_simulate");
  flashCardBtn.innerHTML = `<svg><use xlink:href="#iconRiffCard"></use></svg>`;

  flashCardBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("riffCard");
    },
    false
  );
}
function addSetting() {
  let barMode = document.getElementById("barMode");
  barMode.insertAdjacentHTML(
    "afterend",
    '<div id="barSetting_simulate" class="toolbar__item ariaLabel" aria-label="设置/Settings" ></div>'
  );
  let settingBtn = document.getElementById("barSetting_simulate");
  settingBtn.innerHTML = `<svg><use xlink:href="#iconSettings"></use></svg>`;

  settingBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("config");
    },
    false
  );
}

function addHistory() {
  let barSync = document.getElementById("barSync");
  barSync.insertAdjacentHTML(
    "afterend",
    '<div id="barHistory_simulate" class="toolbar__item ariaLabel" aria-label="数据历史/History" ></div>'
  );
  let historyBtn = document.getElementById("barHistory_simulate");
  historyBtn.innerHTML = `<svg><use xlink:href="#iconHistory"></use></svg>`;

  historyBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("dataHistory");
    },
    false
  );
}

function addRecentDocs() {
  let barSync = document.getElementById("barSync");
  barSync.insertAdjacentHTML(
    "afterend",
    '<div id="barRecentDocs_simulate" class="toolbar__item ariaLabel" aria-label="最近文档/RecentDocs" ></div>'
  );
  let historyBtn = document.getElementById("barRecentDocs_simulate");
  historyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="fill:none;"><path d="M16 22h2c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3"/><polyline points="14 2 14 8 20 8"/><circle cx="8" cy="16" r="6"/><path d="M9.5 17.5 8 16.25V14"/></svg>`;

  historyBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("recentDocs");
    },
    false
  );
}


function addSnippetSetting() {
  let barMode = document.getElementById("barMode");
  barMode.insertAdjacentHTML(
    "afterend",
    '<div id="barSnippet_simulate" class="toolbar__item ariaLabel" aria-label="代码片段" ></div>'
  );
  let settingBtn = document.getElementById("barSnippet_simulate");
  settingBtn.innerHTML = `<svg><use xlink:href="#iconSettings"></use></svg>`;

  settingBtn.addEventListener(
    "click",
    function (e) {
      dispatchKeyEvent("config");
      clearInterval(g_addSnippetInterval);
      g_addSnippetInterval = setInterval(()=>{
           const appBtn = document.querySelector(`[data-key="dialog-setting"] [data-name="appearance"]`);
           if (appBtn) appBtn.click();
           const btn = document.querySelector(`button#codeSnippet`);
           if (btn) {btn.click();clearInterval(g_addSnippetInterval);}  
      }, 50);
    },
    false
  );
}

function hideDailyNodePanel(e) {
  dailyNotePanel.style.visibility = "hidden";
  window.removeEventListener("click", hideDailyNodePanel, false);
  e.stopPropagation();
}

/**
 * 
 */
function dispatchKeyEvent(functionName) {
  let keyInit = parseHotKeyStr(window.top.siyuan.config.keymap.general[functionName].custom);
  keyInit["bubbles"] = true;
  let keydownEvent = new KeyboardEvent('keydown', keyInit);
  document.getElementsByTagName("body")[0].dispatchEvent(keydownEvent);
  let keyUpEvent = new KeyboardEvent('keyup', keyInit);
  document.getElementsByTagName("body")[0].dispatchEvent(keyUpEvent);
}

/**
 * 
 * @param {*} hotkeyStr 思源hotkey格式 Refer: https://github.com/siyuan-note/siyuan/blob/d0f011b1a5b12e5546421f8bd442606bf0b5ad86/app/src/protyle/util/hotKey.ts#L4
 * @returns KeyboardEventInit Refer: https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/KeyboardEvent
 */
function parseHotKeyStr(hotkeyStr) {
  let result = {
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    key: 'A',
    keyCode: 0
  }
  if (hotkeyStr == "" || hotkeyStr == undefined || hotkeyStr == null) {
    console.error("解析快捷键设置失败", hotkeyStr);
    throw new Error("解析快捷键设置失败");
  }
  let onlyKey = hotkeyStr;
  if (hotkeyStr.indexOf("⌘") != -1) {
    result.ctrlKey = true;
    onlyKey = onlyKey.replace("⌘", "");
  }
  if (hotkeyStr.indexOf("⌥") != -1) {
    result.altKey = true;
    onlyKey = onlyKey.replace("⌥", "");
  }
  if (hotkeyStr.indexOf("⇧") != -1) {
    result.shiftKey = true;
    onlyKey = onlyKey.replace("⇧", "");
  }
  // 未处理 windows btn （MetaKey） 
  result.key = onlyKey;
  // 在https://github.com/siyuan-note/siyuan/commit/70acd57c4b4701b973a8ca93fadf6c003b24c789#diff-558f9f531a326d2fd53151e3fc250ac4bd545452ba782b0c7c18765a37a4e2cc
  // 更改中，思源改为使用keyCode判断快捷键按下事件，这里进行了对应的转换
  // 另请参考该提交中涉及的文件
  result.keyCode = keyCodeList[result.key];
  console.assert(result.keyCode != undefined, `keyCode转换错误,key为${result.key}`);
  switch (result.key) {
    case "→": {
      result.key = "ArrowRight";
      break;
    }
    case "←": {
      result.key = "ArrowLeft";
      break;
    }
    case "↑": {
      result.key = "ArrowUp";
      break;
    }
    case "↓": {
      result.key = "ArrowDown";
      break;
    }
    case "⌦": {
      result.key = "Delete";
      break;
    }
    case "⌫": {
      result.key = "Backspace";
      break;
    }
    case "↩": {
      result.key = "Enter";
      break;
    }
  }
  return result;
}

if (g_addFlashCard) addFlashCard();
if (g_addDailyNote) addDailyNote();
if (g_addHistory) addHistory();
if (g_addSetting) addSetting();
if (g_addRecentDocs) addRecentDocs();
if (g_addSnippets) addSnippetSetting();

const keyCodeList = {
  "⌫": 8,
  "⇥": 9,
  "↩": 13,
  "⇧": 16,
  "⌘": 91,
  "⌥": 18,
  "Pause": 19,
  "CapsLock": 20,
  "Escape": 27,
  " ": 32,
  "PageUp": 33,
  "PageDown": 34,
  "End": 35,
  "Home": 36,
  "←": 37,
  "↑": 38,
  "→": 39,
  "↓": 40,
  "PrintScreen": 44,
  "Insert": 45,
  "⌦": 46,
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "A": 65,
  "B": 66,
  "C": 67,
  "D": 68,
  "E": 69,
  "F": 70,
  "G": 71,
  "H": 72,
  "I": 73,
  "J": 74,
  "K": 75,
  "L": 76,
  "M": 77,
  "N": 78,
  "O": 79,
  "P": 80,
  "Q": 81,
  "R": 82,
  "S": 83,
  "T": 84,
  "U": 85,
  "V": 86,
  "W": 87,
  "X": 88,
  "Y": 89,
  "Z": 90,
  "ContextMenu": 93,
  "MyComputer": 182,
  "MyCalculator": 183,
  ";": 186,
  "=": 187,
  ",": 188,
  "-": 189,
  ".": 190,
  "/": 191,
  "`": 192,
  "[": 219,
  "\\": 220,
  "]": 221,
  "'": 222,
  "*": 106,
  "+": 107,
  "-": 109,
  ".": 110,
  "/": 111,
  "F1": 112,
  "F2": 113,
  "F3": 114,
  "F4": 115,
  "F5": 116,
  "F6": 117,
  "F7": 118,
  "F8": 119,
  "F9": 120,
  "F10": 121,
  "F11": 122,
  "F12": 123,
  "NumLock": 144,
  "ScrollLock": 145
};
```

## **17.  JS.自动折叠过长代码块**

这个代码块的效果类似本站和csdn，会将过长的代码块自动折叠。

```js
// see https://ld246.com/article/1727621671852
(()=>{
    // 当代码块内容高度超出多少像素是折叠，注意：这里的高度是指.hljs元素的高度，默认是300px
    const codeMaxHeight = 300;

    // 展开元素样式，可在这里修改
    addStyle(`
        .code-block .code-down {
            width: 100%;
            text-align: center;
            position: absolute;
            bottom: 0px;
            left: 0;
            padding: 70px 0px 10px;
        }
        .code-block .code-down-btn {
            padding: 3px 14px 1px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            cursor: pointer;
        }
        .code-block .code-down-arrow{
            width: 13px;
            height: 13px;
        }
        [data-theme-mode="light"] {
            .code-block .code-down {
                background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
                border-radius: 5px !important; 
            }
            .code-block .code-down-btn {
                background-color: rgba(255, 255, 255, 0.6);
            }
        }
        [data-theme-mode="dark"] {
            .code-block .code-down {
                background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5) 70%, rgba(255, 255, 255, 1));
                border-radius: 5px !important;
            }
            .code-block .code-down-btn {
                background-color: rgba(0, 0, 0, 0.5);
            }
        }
        /* 代码块限制最大高度 CSS片段 */
        div:not(#preview) > .protyle-wysiwyg .code-block .hljs {
            max-height: ${codeMaxHeight || 300}px;
        }
    `);
    whenElementExist(isMobile()?'body':'.layout__center').then(async el => {
        // 监听代码块内容被提交
        //listenCodeUpdate();
        // 加载时执行
        let protyle;
        await whenElementExist(() => {
            protyle = el.querySelector('.protyle');
            return protyle && protyle?.dataset?.loading === 'finished';
        });
        addCodeExtends(protyle.querySelectorAll('.code-block:not(:has(.code-down))'));

        //滚动时执行
        protyle.querySelector(".protyle-content").addEventListener('scroll', () => {
            addCodeExtends(protyle.querySelectorAll('.code-block:not(:has(.code-down))'));
        });

        // 监听protyle加载事件
        observeProtyleAddition(el, protyles => {
            protyles.forEach(async protyle => {
                if(!protyle.classList.contains('protyle')) {
                    protyle = protyle.closest('.protyle');
                }
                // 加载时执行
                addCodeExtends(protyle.querySelectorAll('.code-block:not(:has(.code-down))'));
                // 滚动时执行
                protyle.querySelector(".protyle-content").addEventListener('scroll', () => {
                    addCodeExtends(protyle.querySelectorAll('.code-block:not(:has(.code-down))'));
                });
            });
        });
    });

    let runing = false;
    function addCodeExtends(codeBlocks) {
        if(codeBlocks.length === 0) return;
        if(runing) return; 
        runing = true;
        setTimeout(() => {runing = false;}, 300);
        codeBlocks.forEach(async codeBlock => {
            if(isCursorInCodeBlock(codeBlock)) {
                codeBlock.querySelector('.hljs').style.maxHeight = '100%';
                return;
            }
            if(codeBlock.querySelector('.code-down')) return;
            const hljs = await whenElementExist(() => codeBlock.querySelector('.hljs'));
            if(hljs && hljs.scrollHeight > codeMaxHeight) {
                const expand = document.createElement('div');
                //see https://github.com/88250/lute/issues/206
                expand.className = 'code-down protyle-custom';
                //expand.contentEditable = false;
                expand.innerHTML = `<span class="code-down-btn"><svg class="code-down-arrow"><use xlink:href="#iconDown"></use></svg></span>`;
                codeBlock.appendChild(expand);
                expand.closest('.code-block').querySelector('.hljs').style.maxHeight = codeMaxHeight+'px';
                expand.querySelector('.code-down-btn').onclick = () => {
                    expand.style.display = 'none';
                    expand.closest('.code-block').querySelector('.hljs').style.maxHeight = '100%';
                };
            }
        });
    }

    let isFetchOverridden = false; // 标志变量，用于判断 fetch 是否已经被覆盖
    async function listenCodeUpdate() {
        if (!isFetchOverridden) {
            const originalFetch = window.fetch;
            window.fetch = async function (url, ...args) {
                try {
                    if (url.endsWith('/api/transactions')) {
                        if(args.length > 0) {
                            for(let i in args){
                                if(args[i].body.indexOf(`<div class=\\"code-down\\"`) !== -1) {
                                    let body = JSON.parse(args[i].body);
                                    if(!body.transactions) continue;
                                    for(let j in body.transactions){
                                        if(!body.transactions[j] || !body.transactions[j].doOperations) continue;
                                        for(let k in body.transactions[j].doOperations){
                                            if(!body.transactions[j].doOperations[k] || !body.transactions[j].doOperations[k].data) continue;
                                            body.transactions[j].doOperations[k].data = body.transactions[j].doOperations[k].data.replace(/<div class="code-down".*?<\/div>\n?/ig, '');
                                            body.transactions[j].doOperations[k].data = body.transactions[j].doOperations[k].data.replace(/<div class="code-down"[^>]*?>.*?<\/div>\n?/ig, '');
                                        }
                                    }
                                    body = JSON.stringify(body);
                                    args[i].body = body;
                                }
                            }
                        }
                    }
                    const response = await originalFetch(url, ...args);
                    return response;
                } catch (error) {
                    throw error;
                }
            };
            isFetchOverridden = true; // 设置标志变量，表示 fetch 已经被覆盖
        }
    }

    function addStyle(cssRules) {
        // 创建一个新的style元素
        const styleElement = document.createElement('style');
    
        // 将CSS规则添加到style元素中
        styleElement.innerHTML = cssRules;
    
        // 将style元素插入到文档的head中
        document.head.appendChild(styleElement);
    }
    
    function observeProtyleAddition(el, callback) {
        const config = { attributes: false, childList: true, subtree: true };
        const observer = new MutationObserver((mutationsList, observer) => {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // 查找新增加的 NodeCodeBlock 元素
                    const protyles = Array.from(mutation.addedNodes).filter(node =>
                        node.nodeType === Node.ELEMENT_NODE &&
                        (node.classList.contains('protyle') || node.classList.contains('protyle-content'))
                    );
    
                    // 如果找到了这样的元素，则调用回调函数
                    if (protyles.length > 0) {
                        callback(protyles);
                    }
                }
            });
        });
    
        // 开始观察 body 下的所有变化
        observer.observe(el, config);
    
        // 当不再需要观察时可调用断开来停止观察
        return () => {
            observer.disconnect();
        };
    }

    function isCursorInCodeBlock(codeBlock) {
        if(!codeBlock) return false;
        let cursorEl = getCursorElement();
        if(!cursorEl) return false;
        cursorEl = cursorEl.closest('.code-block');
        if(!cursorEl) return false;
        return cursorEl === codeBlock;
    }

    function getCursorElement() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // 获取选择范围的起始位置所在的节点
            const startContainer = range.startContainer;
            // 如果起始位置是文本节点，返回其父元素节点
            const cursorElement = startContainer.nodeType === Node.TEXT_NODE
                ? startContainer.parentElement
                : startContainer;
    
            return cursorElement;
        }
        return null;
    }

    function isMobile() {
        return !!document.getElementById("sidebar");
    }

    // 等待元素渲染完成后执行
    function whenElementExist(selector) {
        return new Promise(resolve => {
            const checkForElement = () => {
                let element = null;
                if (typeof selector === 'function') {
                    element = selector();
                } else {
                    element = document.querySelector(selector);
                }
                if (element) {
                    resolve(element);
                } else {
                    requestAnimationFrame(checkForElement);
                }
            };
            checkForElement();
        });
    }
})();
```

效果还是不错的。

![image.png](assets/6b1a5b33aeff8f6157a4e6f0362a7b7b-20260206101410-wwtrhva.png)

我在原始代码块的基础上修改了一下css样式，让这里的黑色渐变更浅一点，然后加上了底部的圆角，和代码块上方保持一致。

```css
[data-theme-mode="light"] {
    .code-block .code-down {
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
        border-radius: 5px !important; 
    }
    .code-block .code-down-btn {
        background-color: rgba(255, 255, 255, 0.6);
    }
}
```

![image.png](assets/8e04d73e8b48cd8bfbb387751c24ce05-20260206101410-l3x30rx.png)

## **18. CSS.不同层级标题添加颜色**

不同层级标题设置字体颜色，更加突出层级

```css
 .protyle-wysiwyg .h1 { color: #d40045; }
 .protyle-wysiwyg .h2 { color: #ff7f00; }
 .protyle-wysiwyg .h3 { color: #66b82b; }
 .protyle-wysiwyg .h4 { color: #093f86; }
 .protyle-wysiwyg .h5 { color: #340c81; }
/* https://ld246.com/article/1728445085281 */
```

## **19. CSS.一级标题下划线**

给一级标题的底部添加一个下划线，突出重要性

```css
 .b3-typography .h1, .b3-typography h1, .protyle-wysiwyg .h1, .protyle-wysiwyg h1 {
     /* 这里的边框粗细可以修改2px这个值 */
     border-bottom: 2px solid var(--b3-theme-on-background);
     border-radius: 0;
 }

/* https://ld246.com/article/1728445085281 */
```

## **待更新**

等待后续更新本文……

**文章链接:**   [https://blog.musnow.top/posts/612440692/](https://blog.musnow.top/posts/612440692/)

**版权声明:**   本博客所有文章除特别声明外，均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。转载请注明来源 [慕雪的寒舍](https://blog.musnow.top/)！
