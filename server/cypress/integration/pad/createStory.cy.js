//Context: Create story
describe("Create story",  () => {
    beforeEach(() => {
        cy.visit("http://localhost:8080/#addStories");
    });

    //Test: check if the needed elements exist
    it("Check if the needed fields are present", () => {
        cy.get("#sampleFile").should("exist");
        cy.get("#title").should("exist");
        cy.get("#location").should("exist");
        cy.get("#story").should("exist");
        cy.get("#submit").should("exist");
    });

    it("Creating a story",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"title": "test","text": "test", "location": "test"};

        cy.intercept('POST', '/add_story', {
            statusCode: 200,
            body: mockedResponse,
        }).as('createStory');

        // get the html elements and fill in a value
        cy.get("#title").type("test");
        cy.get("#location").select("de Flat");
        cy.get("#story").type("this is an test");
        cy.get("#submit").click();
        cy.wait("@createStory");

        cy.get("@createStory").should((xhr) => {
            const body = xhr.request.body;
            console.log(body)
            //The body contents need to be the same as the things we filled in
            expect(body.title).equals("test");
            expect(body.location).equals("de Flat");
            expect(body.text).equals("this is an test");
        });
        cy.url().should("contain", "#allStories");
    });


    it("Invalid user input",  () => {
        cy.get("#title").type("Hey");
        cy.get("#location").select("de Flat");
        cy.get("#story").invoke('val', '')
        cy.get("#submit").click();

        // check if there is an error being displayed
        cy.get(".error").should("exist")
    });
});