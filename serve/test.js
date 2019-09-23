console.log("test.js");

if(!window._block_lang_widgets_) {
    window._block_lang_widgets_ = {};
}
// key 的值与部件的文件夹名相同
const widgetMap = {"text-input": "done"};
// 使用 {website}/{owner}/{repoName} 唯一标识组件库中的 Widget
window._block_lang_widgets_["github.com/blocklang/ide-widgets-bootstrap"] = widgetMap;