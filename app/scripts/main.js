const values = [
  {min: 0.0, max: 45.0},
  {min: 45.0, max: 90.0},
  {min: 90.0, max: 130.0},
  {min: 130.0, max: 180.0},
  {min: 180.0, max: 99999999}
];

const rating = [0, 1, 2, 3, 4, 5];

$(document).ready(function() {
  var config = {};
  firebase.initializeApp(config);
  window.ref = firebase.database().ref()

  $('input').change(onCheck);

  onCheck();

})

function onCheck() {
  const menus = [
    'rating',
    'price'
  ]

  var ratings = [];
  var budgets = [];

  // get selected ratings
  $('#rating').find('input:checked').each(function(key, value) {
    ratings.push(parseInt(this.value, 10))
  });
  if (ratings.length === 0) {
    ratings = [0, 1, 2, 3, 4, 5];
  }

  $('#price').find('input:checked').each(function(key, value) {
    budgets.push(parseInt(this.value, 10));
  });
  let requests = [];
  var results = {}

  var url = '';
  for (var rating of ratings) {
    url = `${rating}`;
    if (budgets.length === 0 ) {
      requests.push(window.ref
        .child(`hotels/${rating}`)
        .orderByChild('minrate')
        .once('value', function(s) {
          const value = s.val();
          for (var property in value) {
              if (value.hasOwnProperty(property)) {
                results[property] = value[property];
              }
          }
        }, console.error));

    } else {
      for (var range of budgets) {
        requests.push(
          window.ref
            .child(`hotels/${rating}`)
            .orderByChild('minrate')
            .startAt(values[range].min)
            .endAt(values[range].max)
            .once('value', function(s) {
              const value = s.val();
              if (value !== null)
                for (var property in value) {
                    if (value.hasOwnProperty(property)) {
                      results[property] = value[property];
                    }
                }
            }, console.error)
          );
      }
    }
  }

  Promise.all(requests).then(function() {
    $('#results').text(prettify(results));
    $('#resultsCount').text(Object.keys(results).length);
  })
}



function prettify(obj) {
  return JSON.stringify(obj, null, 2);
}
