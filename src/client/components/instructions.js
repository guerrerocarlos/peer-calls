const React = require('react');
const Transition = require('react-addons-css-transition-group');
// const notificationsStore = require('../store/notificationsStore.js');
const instructionsStore = require('../store/instructionsStore.js');

function instructions(props) {
  let notifs = instructionsStore.getInstructions(props.max || 10);
  let instructionsElements = notifs.map(notif => {
    return (
      <div className={notif.type + ' instruction'} key={notif._id}>
        {notif.message}
      </div>
    );
  });

  console.log(instructionsElements)
  return (
    <div className="instructions">
      <Transition
        transitionEnterTimeout={5000}
        transitionLeaveTimeout={5000}
        transitionName="fade"
      >
        {instructionsElements}
      </Transition>
    </div>
  );

}

module.exports = instructions;
