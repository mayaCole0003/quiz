$(document).ready(function() {
  var quizData;
  var addedQuestions = [];

  function loadQuizData() {
      $.ajax({
          url: 'data.json',
          dataType: 'json',
          success: function(data) {
              quizData = data;
              $('#quizTitle').text(data.title);

              var questionsContainer = $('#questionsContainer');
              questionsContainer.empty(); 

              $.each(data.questions, function(index, question) {
                  if (addedQuestions.includes(question.question_name)) {
                      return;
                  }

                  var questionBox = $('<div class="container"><div class="question-box"></div></div>');
                  var questionTitle = $('<div class="question"><h2>' + question.question_name + '</h2></div>');
                  questionBox.append(questionTitle);

                  var answersGridClass = 'answers-grid-' + question.question_name.replace(/\s/g, '');

                  var answersGrid = $('<div class="answers-grid ' + answersGridClass + '"></div>');

                  $.each(question.answers, function(i, answer) {
                    var input = $('<input type="radio" id="' + answer.text + 
                                  '" name="' + question.question_name + 
                                  '" value="' + answer.text + '">');
                    var label = $('<label for="' + answer.text + '" class="answer">' + 
                                  answer.text + '</label>');
                
                    var imgURL = answer.img_url;
                    if (imgURL) {

                        label.css('background-image', 'url("' + imgURL + '")');
                        label.css({
                            'background-size': 'cover',
                            'display': 'inline-block'
                        });
                    }
                
                    answersGrid.append(input).append(label);
                });
                
                  questionBox.append(answersGrid);
                  questionsContainer.append(questionBox);

                  addedQuestions.push(question.question_name);
              });
          },
      });
  }

  function getOutcome(questionName, answerText) {
      var outcome = null;
      $.ajax({
          url: 'data.json',
          dataType: 'json',
          async: false,
          success: function(data) {
              var question = data.questions.find(q => q.question_name === questionName);
              if (question) {
                  var answer = question.answers.find(a => a.text === answerText);
                  if (answer) {
                      outcome = answer.outcome;
                  }
              }
          }
      });
      return outcome;
  }

  function calculateMostCommonOutcome(choices) {
      var counts = {};
      var mostCommonOutcome = null;
      var maxCount = 0;

      choices.forEach(function(choice) {
          counts[choice] = (counts[choice] || 0) + 1;
          if (counts[choice] > maxCount) {
              maxCount = counts[choice];
              mostCommonOutcome = choice;
          }
      });

      return mostCommonOutcome;
  }


  function triggerErrorModal() {
    var modalData = quizData.outcomeError.modal;
    $('#modalTitle').text(modalData.title);
    $('#modalContent').text(modalData.content);
    $('#exampleModal').modal('show');
    $('#modalTitle').text(modalData.title);
    $('#modalImg').attr('src', modalData.img);
  }
  

  function triggerModal(outcome) {
      console.log("in modal");
      if (outcome && quizData.outcomes[outcome] && quizData.outcomes[outcome].modal) {
      var modalData = quizData.outcomes[outcome].modal;
      console.log("data:", modalData);
      $('#modalTitle').text(modalData.title);
      $('#modalImg').attr('src', modalData.img);
    $('#modalContent').text(modalData.content);
      $('#exampleModal').modal('show');
  }
  }

  $(document).on('click', '.answer', function() {
    var $parentGrid = $(this).closest('.answers-grid');

    $parentGrid.find('.answer').removeClass('button-active').addClass('button-faded');
    
    $(this).removeClass('button-faded').addClass('button-active');
});




  function main() {
      loadQuizData();

      $('#DoneBtn').on('click', function(e) {
          var choices = $("input[type='radio']:checked").map(function(i, radio) {
              var questionName = $(radio).attr("name");
              var answerText = $(radio).val();

              return getOutcome(questionName, answerText);
          }).toArray();

          if (choices.length < quizData.questions.length) {
            console.log("not ev=nough answwres");
            triggerErrorModal();
            return; 
        }


          var mostCommonOutcome = calculateMostCommonOutcome(choices);

          console.log("Most common outcome:", mostCommonOutcome);

          triggerModal(mostCommonOutcome);
      });
  }

  main();
});
  
