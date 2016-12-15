console.log('main');

// var config = new AWS.Config({
//   accessKeyId: 'AKIAIBRC5FGJYSPIRVHA', secretAccessKey: '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', region: 'ap-northeast-1'
// });

AWS.config.update({
  region: 'ap-northeast-1',
  credentials: {accessKeyId: 'AKIAIBRC5FGJYSPIRVHA', secretAccessKey: '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'}
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: 'leeyen-ebooks'}
});

listAlbums();
function listAlbums() {
  var params = {
    "Bucket": "leeyen-ebooks"
  };
  s3.listObjects(params, function(err, data) {
    console.log(data);
    // if (err) {
    //   return alert('There was an error listing your albums: ' + err.message);
    // } else {
    //   var albums = data.CommonPrefixes.map(function(commonPrefix) {
    //     var prefix = commonPrefix.Prefix;
    //     var albumName = decodeURIComponent(prefix.replace('/', ''));
    //     return getHtml([
    //       '<li>',
    //         '<span onclick="deleteAlbum(\'' + albumName + '\')">X</span>',
    //         '<span onclick="viewAlbum(\'' + albumName + '\')">',
    //           albumName,
    //         '</span>',
    //       '</li>'
    //     ]);
    //   });
    //   var message = albums.length ?
    //     getHtml([
    //       '<p>Click on an album name to view it.</p>',
    //       '<p>Click on the X to delete the album.</p>'
    //     ]) :
    //     '<p>You do not have any albums. Please Create album.';
    //   var htmlTemplate = [
    //     '<h2>Albums</h2>',
    //     message,
    //     '<ul>',
    //       getHtml(albums),
    //     '</ul>',
    //     '<button onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
    //       'Create New Album',
    //     '</button>'
    //   ]
    //   document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    // }
  });
}