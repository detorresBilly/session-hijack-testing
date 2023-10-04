document.addEventListener('DOMContentLoaded', () => {
    const dataList = document.getElementById('post-list');
    const userHeader = document.getElementById('user-header')

    fetch('/api/user')
    .then((response) => response.json())
    .then((data) => {
        userHeader.innerText = `Logged in as: ${data.name}`;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  
    fetch('api/posts')
      .then((response) => response.json())
      .then((data) => {
        data.forEach((item) => {
            const listItem = document.createElement('li');
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            const authorSpan = document.createElement('span');
            authorSpan.className = 'author';
            authorSpan.textContent = item.author;
            const dateSpan = document.createElement('span');
            dateSpan.className = 'date';
            dateSpan.textContent = item.datePosted;
            const contentP = document.createElement('p');
            contentP.className = 'content';
            contentP.innerHTML = item.content;
            postDiv.appendChild(authorSpan);
            postDiv.appendChild(dateSpan);
            postDiv.appendChild(contentP);
            listItem.appendChild(postDiv);
            dataList.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

});