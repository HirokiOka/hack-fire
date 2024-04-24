function openSurvey() {
    const surveyWindow = window.open('', 'survey', 'width=400,height=300');
    surveyWindow.document.write(`
        <h1>しつもんです</h1>
        <form>
            <p>プログラミングをしてみたい？</p>
            <input type="radio" id="very-high" name="programming" value="very-high">
            <label for="very-high">とてもしてみたい！</label><br>
            <input type="radio" id="high" name="programming" value="high">
            <label for="high">してみたい</label><br>
            <input type="radio" id="normal" name="programming" value="normal">
            <label for="low">ふつう</label><br>
            <input type="radio" id="low" name="programming" value="low">
            <label for="low">してみたくない</label><br>
            <input type="radio" id="very-low" name="programming" value="very-low">
            <label for="very-low">ぜんぜんしてみたくない</label><br>
            <button type="button" onclick="submitSurvey()">送信</button>
        </form>
    `);

    surveyWindow.document.close();
    surveyWindow.focus();

    function submitSurvey() {
      const selected = surveyWindow.document.querySelector('input[name="programming"]:checked').value;
      alert(`You selected ${selected}.`);
      surveyWindow.close();
    }
    surveyWindow.submitSurvey = submitSurvey;
}
