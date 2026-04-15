Feature: Background texture for grounded card placement
  Layered texture stack on page background (gradient + noise + grid)
  with contact shadow on cards to create a "placed" feel.

  Approach: Layered Texture Stack with contact shadow

  # Integration Contract:
  # Entry Point: Every page (body-level CSS)
  # Caller Code: index.html global styles

  Scenario: Page has textured background
    Given I am on the home page
    When the page loads
    Then the body has a warm gradient overlay
    And the body has a noise grain texture
    And the body has a faint grid pattern

  Scenario: Cards have contact shadow instead of float shadow
    Given I am on the home page
    When I look at any card element
    Then the card has a 1px tan border
    And the card has a tight contact shadow at its base
    And the card does not have a diffuse float shadow
