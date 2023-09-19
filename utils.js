export async function getActiveTabURL(){
    let queryOptions ={active:true,currentWindow:true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
//Delete icon
//https://www.flaticon.com/free-icon/delete_1214428?term=delete&page=1&position=1&origin=search&related_id=1214428