Feature: Tabbed interface for Jetty Method panel
  Notion-style slide-in panel tabs for the Jetty Method section

  Approach: Slide-in Panel Tabs (Option 3)

  # Integration Contract:
  # Entry Point: Home page (index.html)
  # Caller Code: .jetty-way-section in index.html

  # INTEGRATION SCENARIO
  Scenario: User sees tabbed interface on home page
    Given I am on the home page
    When I scroll to the Jetty Method section
    Then I see a tabbed interface with tabs on the left
    And I see "Build robust, comprehensive features." as the first tab

  # FEATURE SCENARIOS
  Scenario: First tab is active by default with mode selector content
    Given I am on the home page
    And I am viewing the Jetty Method section
    Then the "Build robust, comprehensive features." tab is active
    And I see the mode selector with Speed, Stable, and Production options
    And I see the triangle diagram

  Scenario: Clicking a tab switches content with slide animation
    Given I am on the home page
    And I am viewing the Jetty Method section
    When I click the "AI-managed backlog." tab
    Then the content slides out and new content slides in
    And the "AI-managed backlog." tab is now active
    And the slide indicator moves to the active tab

  Scenario: Each tab displays its respective content
    Given I am on the home page
    And I am viewing the Jetty Method section
    When I click through each tab
    Then each tab shows its corresponding content panel

  # SPEED MODE: All success scenarios above
  # STABLE MODE: Will add error handling, edge cases (e.g., rapid clicking)
