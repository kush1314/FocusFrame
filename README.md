##Inspiration
FocusFrame was born from a mix of creativity, fun, and challenge. Like many students, we struggled to stay focused on our work while working on our laptops. No matter how many times we told ourselves that "this time, I'll get my work done!", we always wound up on our phones or other distractions. That’s why we created FocusFrame, an intuitive Chrome Extension that uses your camera and reminds you to get back to work when it sees you off topic!

##What it does
FocusFrame keeps you accountable while working on your computer. Using facial recognition and activity tracking, it monitors your focus through your webcam (locally, with full privacy) and detects when your attention drifts away, like when you look at your phone or walk away from your desk. When that happens, FocusFrame provides friendly visual or auditory nudges to help you refocus. You can also customize your experience: set productivity goals, choose reminder styles (subtle or assertive), and track focus trends over time through simple analytics. It’s like having a personal accountability partner that lives in your browser.

##How we built it
We built FocusFrame as a Chrome Extension using JavaScript, HTML, and CSS for the front-end and Python (OpenCV libraries) on the backend, connecting them via Flask. We designed it to work entirely locally, meaning no camera data is ever sent or stored online. The extension continuously monitors for facial presence and attention direction, then triggers notifications through the Chrome API if the user appears distracted. 

##Challenges we ran into
One of our biggest challenges was connecting the frontend and backend seamlessly within a Chrome Extension environment. Since FocusFrame relies on real-time camera input and background logic, synchronizing data between the user interface, the camera processing scripts, and the background service workers required a lot of debugging. Another major hurdle was ensuring consistent performance across different operating systems, especially between Windows and macOS, where camera permissions, browser behavior, and resource management differ. We also faced difficulties making TensorFlow.js models run reliably on lower-end devices without lag or excessive CPU usage. Finally, fine-tuning reminder triggers so they felt helpful rather than intrusive took careful calibration and user testing.


##What's next for FocusFrame
We plan to expand FocusFrame into a full productivity companion. Future updates will include integration with tools like Google Calendar and Notion to help schedule focused sessions automatically. We also want to build Focus Analytics, a dashboard showing your daily focus score and progress over time. Additionally, we’re exploring using posture and emotion detection to give even more personalized feedback. In the long run, we hope FocusFrame becomes a tool that helps students take control of their attention and make every minute count!
