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

  # Stable Mode Scenarios - Error Handling and Edge Cases

  Scenario: Background texture layers do not block user interaction
    Given I am on the home page
    When I try to click interactive elements
    Then all buttons and links remain clickable
    And the texture layers have pointer-events none

  Scenario: Background textures do not cause layout overflow
    Given I am on the home page
    When the page loads
    Then the texture layers do not cause a horizontal scrollbar
    And the texture layers are contained within the viewport

  Scenario: Content renders above background texture layers
    Given I am on the home page
    When the page loads
    Then all content sections have higher z-index than texture layers
    And text remains readable over the textured background

  Scenario: All card types have consistent contact shadow
    Given I am on the home page
    When I inspect each card element on the page
    Then every card has a contact shadow with small vertical offset
    And no card has a diffuse shadow with large blur values

  Scenario: Card borders are consistent across all card types
    Given I am on the home page
    When I inspect each card element on the page
    Then every card border is exactly 1px
    And every card border uses the tan border color
