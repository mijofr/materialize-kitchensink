describe('Forms:', function() {
  beforeEach(async function() {
    await XloadFixtures(['forms/formsFixture.html']);
    M.CharacterCounter.init(document.querySelector("#character-counter"));
  });

  afterEach(function(){
    XunloadFixtures();
  });

  let inputs

  beforeEach(function() {
    inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
      input.focus();
      input.blur();
    });
    window.location.hash = "";
  });

  describe("CharacterCounter", () => {

    it("Should initialize", () => {
      let el = document.querySelector("#character-counter");
      expect(() => M.CharacterCounter.getInstance(el)).not.toThrow();
      expect(M.CharacterCounter.getInstance(el)).toBeTruthy();
    });

    it("Should exhibit counter", () => {
      let counter = document.querySelector("#character-counter ~ .character-counter");
      expect(counter.textContent).toBe("0/10");
    });

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
