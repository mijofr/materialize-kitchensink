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

  // No active class added, because it is now a css feature only
  /*
  it("should keep label active while focusing on input", function () {
    inputs.forEach(input => {
      expect(input.labels[0]).not.toHaveClass('active')
      input.focus()
      expect(input.labels[0]).toHaveClass('active')
      input.blur()
      expect(input.labels[0]).not.toHaveClass('active')
    })
  });
  */

});
