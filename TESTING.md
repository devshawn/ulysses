# Protractor Testing Tutorial

[Protractor](http://www.protractortest.org/#/) allows for end-to-end (e2e) testing of your whole software package. It runs tests in a real browser such as Google Chrome and utilizes [Selenium](http://www.seleniumhq.org/).

### Adding it to your project

First, change this line in `package.json`:
```javascript
"update-webdriver": "node node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update"
```

To this line:

```javascript
"update-webdriver": "node node_modules/protractor/bin/webdriver-manager update"
```

Next, run the following command in the terminal in your project's root directory.

`npm run update-webdriver`

### Running the generated e2e tests

To run the generated tests, run the following command in the terminal in your project's root directory:

`grunt test:e2e`

Note: They will most likely fail as you have changed some of the default project stuff.

### Adding tests to your project & updating existing ones
#### Default Tests
Protractor tests are stored in the `/e2e` folder in your project root. By default, there are 2 or 3 default e2e locations:
- `/e2e/account`: For testing login, logout, and signups _(if you have authentication)_.
- `/e2e/components`: For testing components such as the navbar
- `/e2e/main`: For testing the main controller

#### Creating your own tests
To create more tests, simply make a new folder. I name mine the same as the client-side routes. For example, my project's jobs page `localhost:9000/jobs` is in the folder `/client/app/job`. I then created `/job` in the `/e2e` folder. Thus, I can now add end-to-end tests in `/e2e/job` for testing my job page functionality.

To create end-to-end tests, we want to create two files in this new folder:
- `job.po.js`: This is the page object definition. This is where you find elements based on your CSS and HTML. This helps with testing and not writing repetitive code. More on this later.
- `job.spec.js`: This is where we write the actual tests. We use the familiar jasmine testing syntax such as _describe_ and _it_.

#### Writing the tests
##### Page Object (job.po.js)
Defining page objects is fairly easy, and follows the following syntax. Let's create the job page order:

```javascript
'use strict';

var JobPage = function() {
  this.container = element(by.css('.job-container'));
  this.panelBody = this.container.element(by.css('.panel-body'));
};

module.exports = new JobPage();
```

As we see above, we define a new function and set it to export when we include this module. Cool. We can use what are called [locators](http://www.protractortest.org/#/locators) to find certain things in our HTML. I only use by.css() here, as I'm only looking for classes. Imagine by job.html looks like this on the client-side:

```html
<div class="panel panel-default job-container">
  <div class="panel-body">There are currently no jobs.</div>
</div>
```

In my page object file, I am finding the div with `job-container` as a class _(as symbolized by the dot in front of it)_ and setting it to `this.container`. Next, I am looking for the div with the class `panel-body` inside of `this.container`. This becomes useful later.

##### The Test File (job.spec.js)

Let's write our first basic test:

```javascript
'use strict';
var config = browser.params;

describe('Job View', function() {
  var page;

  beforeEach(function() {
    browser.get(config.baseUrl + '/jobs');
    page = require('./job.po');
  });

  it('should say that we have no jobs', function() {
    expect(browser.getCurrentUrl()).toBe(config.baseUrl + '/jobs'); //1
    expect(page.panelBody.getText()).toBe('There are currently no jobs.'); //2
  });
});
```

In our `beforeEach`, we have a GET request to `localhost:9000/jobs`. We then set _page_ to our jobs page object module, which we will utilize in our test.

Inside of our _it_ test, we write two expectations. First, we check if the browser's current URL is `localhost:9000/jobs`. Next, we check if the text of `page.panelBody` _(which we defined in our page object to be the panel-body of job-container)_ is equal to _There are currently no jobs_. These are very simple tests -- adding authentication and button clicking is a bit more advanced but easily doable.

### Page Objects - What they are and how to use them

Page objects are defining things you can do on certain pages. For example, the login page object has functions to find and enter text into the username and password field and click the login button. You can then call this page object by requiring it in other files and calling it's functions. There is a helpful powerpoint explaining this that you can get to by [clicking here](https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ).
