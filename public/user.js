//document event listener
//                      ___..-.---.---.--..___
//                _..-- `.`.   `.  `.  `.      --.._
//               /    ___________\   \   \______    \
//               |   |.-----------`.  `.  `.---.|   |
//               |`. |'  \`.        \   \   \  '|   |
//               |`. |'   \ `-._     `.  `.  `.'|   |
//              /|   |'    `-._o)\  /(o\   \   \|   |\
//            .' |   |'  `.     .'  '.  `.  `.  `.  | `.
//           /  .|   |'    `.  (_.==._)   \   \   \ |.  \         _.--.
//         .' .' |   |'      _.-======-._  `.  `.  `. `. `.    _.-_.-'\\
//        /  /   |   |'    .'   |_||_|   `.  \   \   \  \  \ .'_.'     ||
//       / .'    |`. |'   /_.-'========`-._\  `.  `-._`._`. \(.__      :|
//      ( '      |`. |'.______________________.'\      _.) ` )`-._`-._/ /
//       \\      |   '.------------------------.'`-._-'    //     `-._.'
//       _\\_    \    | AMIGA  O O O O * * `.`.|    '     //
//      (_  _)    '-._|________________________|_.-'|   _//_
//      /  /      /`-._      |`-._     / /      /   |  (_  _)
//    .'   \     |`-._ `-._   `-._`-._/ /      /    |    \  \
//   /      `.   |    `-._ `-._   `-._|/      /     |    /   `.
//  /  / / /. )  |  `-._  `-._ `-._          /     /   .'      \
// | | | \ \|/   |  `-._`-._  `-._ `-._     /     /.  ( .\ \ \  \
//  \ \ \ \/     |  `-._`-._`-._  `-._ `-._/     /  \  \|/ / | | |
//   `.\_\/       `-._  `-._`-._`-._  `-._/|    /|   \   \/ / / /
//               /    `-._  `-._`-._`-._  ||   / |    \   \/_/.'
//             .'         `-._  `-._`-._  ||  /  |     \
//    LGB     /           / . `-._  `-._  || /   |      \
//           '\          / /      `-._    ||/'._.'       \
//            \`.      .' /           `-._|/              \
//             `.`-._.' .'               \               .'
//               `-.__\/                 `\            .' '
//                                        \`.       _.' .'
//                                         `.`-._.-' _.'
//                                           `-.__.-'

document.addEventListener('DOMContentLoaded', () => {
    //use a js framework 
    const dataList = document.getElementById('post-list');
    const userHeader = document.getElementById('user-header')
    // async api call to user endpoint
    fetch('/api/user')
    .then((response) => response.json())
    .then((data) => {
        userHeader.innerText = `Logged in as: ${data.name}`;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
    // async api call to posts endpoint
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
