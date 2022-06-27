describe('Forms:', function() {
  beforeEach(async function() {
    await XloadFixtures(['forms/formsFixture.html']);
  });

  afterEach(function(){
    XunloadFixtures();
  });

  let inputs

  beforeEach(function() {
    inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.blur())
    window.location.hash = "";
  });

  it("should keep label active while focusing on input", function () {
    inputs.forEach(input => {
      expect(input.previousElementSibling).not.toHaveClass('active')
      input.focus()
      expect(input.previousElementSibling).toHaveClass('active')
      input.blur()
      expect(input.previousElementSibling).not.toHaveClass('active')
    })
  });
});
