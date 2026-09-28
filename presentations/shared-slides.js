// Slides that must read exactly the same in both decks, so the message does not drift.
const k = require('./deck-kit');

/**
 * Why an agent builds this kind of work faster than a person.
 * Deliberately general - these hold for any team, not just what happened in our session.
 */
function whyFaster(pptx) {
  const { s, top } = k.contentSlide(pptx, {
    title: 'Why it is faster - four reasons',
    kicker: 'None of them is "it types quickly"',
  });

  k.cards(s, [
    {
      title: '1. It reads the whole system at once',
      lead: 'A person opens one file at a time.',
      items: [
        'To write a test you have to know exactly what each field and button is called',
        'A person clicks around and guesses, or searches the code by hand',
        'The agent reads the source and takes the real names straight from it',
      ],
    },
    {
      title: '2. It works without stopping',
      lead: 'No meetings, no context switching.',
      color: k.C.good,
      items: [
        'Work like this is normally spread over days, and part of every day goes on remembering where you were',
        'The agent does it as one continuous job',
      ],
    },
    {
      title: '3. Try, fail, fix - in seconds',
      lead: 'That loop is where the time really goes.',
      color: k.C.warn,
      items: [
        'Automation is mostly: run it, see what broke, fix it, run it again',
        'For a person each turn of that loop costs minutes and patience; here it is seconds, repeated without fatigue',
      ],
    },
    {
      title: '4. It does the parts we skip',
      lead: 'Structure, evidence, documentation.',
      color: k.C.accent,
      items: [
        'Consistent naming, a README, screenshots and reports come as standard',
        'These are the first things dropped when a deadline is close - and the reason the next person starts from nothing',
      ],
    },
  ], { y: top, h: 4.25 });

  k.callout(s, 'A person is fast at deciding what matters. The agent is fast at everything around it. That is why the pair beats either one alone.', {
    y: top + 4.45, h: 0.72,
  });
}

module.exports = { whyFaster };
