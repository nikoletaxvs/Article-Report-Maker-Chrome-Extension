(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentArticle = "";
    let currentArticleBookmarks = [];
    let data ={};

    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
        const { type, articleNumber } = obj;
        //console.log(`current article bookmarks ${obj.bookmarks[0].id} ${obj.value.split('-')[1]}`);
        if (type === "NEW") {
            currentArticle = articleNumber;
            ArticleLoaded();
        }else if ( type === "DELETE") {
            const bookmarksList = obj.bookmarks;
            const bookmarkToDelete = obj.value.split('-')[1];
            currentArticleBookmarks = bookmarksList.filter((b) => b.id != bookmarkToDelete);
            chrome.storage.sync.set({ ['bookmarks_key']: JSON.stringify(currentArticleBookmarks) });     
            response(currentArticleBookmarks);
        }else if(type == "CLEAR"){
            currentArticleBookmarks=[];
            chrome.storage.sync.set({['bookmarks_key']: JSON.stringify(currentArticleBookmarks)});
            response(currentArticleBookmarks);
        }
    });

    const ArticleLoaded=()=>{
        //Find element that contains the bookmark icon
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        //If that element doesn't exist create it
        if(!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button"+"bookmark-btn";
            bookmarkBtn.title = "click to add article to report";
            bookmarkBtn.style.width = "3em";
            article_controls = document.getElementsByClassName("field-item even")[1];
            article_controls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler);
        }
    };
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get(["bookmarks_key"], (obj) => {
            resolve(obj["bookmarks_key"] ? JSON.parse(obj["bookmarks_key"]) : []);
          });
        });
      };
    const addNewBookmarkEventHandler = async () => {
        const currentTitle =document.getElementsByClassName("field-item even")[1].getElementsByTagName("h1")[0].innerHTML;
        const currentId = window.location.href.split('/article')[1].split('/')[1]
        const newBookmark = {
          id: currentId,
          title: currentTitle,
          desc: `Bookmark at ${currentTitle} `,
          articleURL: window.location.href,
          time: new Date().getTime().toString()
        };
    
        currentArticleBookmarks = await fetchBookmarks();
        let check = currentArticleBookmarks.some(x => x.id === currentId);
        console.log(check);
       
        if(!check){
            chrome.storage.sync.set({
            ["bookmarks_key"]: JSON.stringify([...currentArticleBookmarks, newBookmark].sort((a, b) => a.time - b.time))
            });
        }else{
            console.log(`You have already added article ${newBookmark.id}`);
        }
       
    };
    
    ArticleLoaded();
})();


