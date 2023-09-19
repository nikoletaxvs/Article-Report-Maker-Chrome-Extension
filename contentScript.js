(() => {
    //let youtubeLeftControls, youtubePlayer;
    let currentArticle = "";
    let currentArticleBookmarks = [];
    //let data ={};
    //Method Info 
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
            chrome.storage.local.set({ ['bookmarks_key']: JSON.stringify(currentArticleBookmarks) });    
            response(currentArticleBookmarks);
        }else if(type == "CLEAR"){
            currentArticleBookmarks=[];
            chrome.storage.local.set({ ['bookmarks_key']: JSON.stringify(currentArticleBookmarks) });
            response(currentArticleBookmarks);
        }
    });

    //Adds "Add" button if an eirinika article page is detected
    const ArticleLoaded=()=>{
        //Find element that contains the bookmark icon
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        //If that element doesn't exist create it
        if(!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("button");
            //bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button"+" bookmark-btn";
            bookmarkBtn.title = "click to add article to report";
            bookmarkBtn.innerHTML = "Add to Report";
            //bookmarkBtn.style.cssText="background-color: #FFFFFF;border: 0;border-radius: .5rem;box-sizing: border-box;color: #111827;font-size: 16px;font-weight: 700;line-height: 1.25rem;padding: .75rem 1rem;text-align: center;text-decoration: none #D1D5DB solid;text-decoration-thickness: auto;box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);cursor: pointer;user-select: none;-webkit-user-select: none;";
            bookmarkBtn.style.cssText = `display: inline-block;
            outline: none;
            cursor: pointer;
            font-size: 14px;
            padding: 0 12px;
            line-height: 20px;
            height: 30px;
            max-height: 30px;
            background: #fff;
            font-weight: 700;
            border: 2px solid #DAE3F3;
            border-radius: 0;
            color: #272C34;
            transition-timing-function: ease-in-out;
            transition-property: box-shadow;
            transition-duration: 150ms;
            :hover {
                box-shadow: 0 2px 2px rgb(39 44 52 / 12%);
            }`;
            article_controls = document.getElementsByClassName("field-item even")[1];
            article_controls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler);
            bookmarkBtn.addEventListener("mouseover",createHoverEffect);
            bookmarkBtn.addEventListener("mouseout",createHoverEffect2);
        }
    };
    //Method : Retrieves all articles from storage
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
          chrome.storage.local.get(["bookmarks_key"], (obj) => {
            resolve(obj["bookmarks_key"] ? JSON.parse(obj["bookmarks_key"]) : []);
          });
        });
      };
    const createHoverEffect = async ()=>{
        const bookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
        if(bookmarkBtn){
            bookmarkBtn.style.color='white';
            bookmarkBtn.style.backgroundColor='#272C34';
        }
    }
    const createHoverEffect2 = async ()=>{
        const bookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
        if(bookmarkBtn){
            bookmarkBtn.style.color='#272C34';
            bookmarkBtn.style.backgroundColor='#fff';
        }
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTitle =document.getElementsByClassName("field-item even")[1].getElementsByTagName("h1")[0].innerHTML;
        const currentId = window.location.href.split('/article')[1].split('/')[1];
        
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
            chrome.storage.local.set({
            ["bookmarks_key"]: JSON.stringify([...currentArticleBookmarks, newBookmark].sort((a, b) => a.time - b.time))
            });
        }else{
            console.log(`You have already added article ${newBookmark.id}`);
        }
       
    };
    
    ArticleLoaded();
})();


