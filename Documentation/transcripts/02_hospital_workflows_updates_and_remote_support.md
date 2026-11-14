# Hospital workflows, updates, and remote support

Cleaned transcript. The recording begins mid-sentence. Speaker labels indicate conversational roles, not identified individuals. Unrecoverable wording is marked in brackets; estimates and descriptions of policy are retained as the speakers' statements.

Expert: …and then get the patient information onto the system and continue with the procedure. Of course, there are also many customers where you can simply refresh the worklist and retrieve the patients. But there is enormous variation between hospitals. Some are almost living in the Stone Age.

Participant: It is almost as if you need a list of hospitals you would rather not end up in.

Expert: Once we have the patient information, we work within the procedure.

There are also safety restrictions in the system. If a patient examination is open, certain deeper settings and system operations are unavailable. Someone cannot accidentally press a button and trigger an update during an examination.

That is for safety. Even a background operation could introduce instability while the system is being used on a patient. Nobody wants a device that helps the surgeon perform a procedure to stop working. The system is primarily an instrument—one part of the procedure, like other surgical instruments.

Participant: How do you switch the machine off? Do you shut down the computer rather than disconnecting the cables?

Expert: Yes. There is a button: press it, and the system shuts down. You do not have to navigate through an exit menu.

Sometimes a customer calls because the system is not behaving as expected, and the first recommendation is, “Have you tried rebooting it?” That cannot require four clicks. Every additional click becomes a problem. Customers keep asking for fewer clicks because they do not want to remember a long sequence.

They press the button, it shuts down, and they press it again to boot it up.

Participant: Could that action trigger a reminder that an update is available?

Expert: I am not saying it would be technically impossible, but it could annoy many customers. Especially during a procedure, their attitude is, “I want to concentrate on my work. I do not care what the system wants from me right now. I want to do something with the system.”

Participant: Can updates be skipped, or must users install every version in sequence? Suppose they miss version 5.1 because they are busy or people are on holiday, and version 5.2 arrives a month later.

Expert: If the system is properly connected to the backend, the backend can recognize that the previous update has not been performed and handle the next package accordingly. Storage for downloaded packages is limited.

Participant: Could users eventually be locked out, as they might be on a company phone that has missed a required update?

Expert: In a busy medical environment, you cannot simply block access to the system because an update is outstanding. A patient may need it.

Participant: When the machine is online, does it report that it has been updated? Does that go to fleet management, to the people responsible at the hospital, and to you? Can you see your update adoption rate?

Expert: Yes, if it is remotely connected, we receive information that it is now on the next software version. We can analyze that and discuss the update status in our meetings—for example, what proportion of systems have completed an update.

Participant: Do you have a number, such as 80%?

Expert: Not a general number I can give you. The system for which tracking has become easier does not yet have a very large installed base, so it is relatively easy to follow. For other product lines, there may be thousands of systems in the field.

We can check, but adoption can take time. Sometimes customers skip updates until a technician visits the site and installs several of them because the customer has never done it independently.

Participant: You use a phased rollout, right? You do not send an update to every machine at once. You send it to some, see how it goes, and continue.

Expert: Yes.

Participant: How do you plan that rollout? Do customers who have had problems receive it earlier or later? Is feedback and log data part of that decision?

Expert: Exactly. If we have escalation sites, we prioritize them.

Participant: I would have expected the opposite: prove that the update works elsewhere before taking it to a site that has already had problems.

Expert: They would not necessarily be the very first test sites, but they are usually in the first wave.

We have heavily escalated cases that we call “hot sites.” There is a lot of attention on them, both internally and at the customer. In the worst case, the customer may want to return the system, receive reimbursement, or get a replacement or an upgrade.

There is a lot of pressure to resolve those cases. We work with the local country organizations to satisfy the customer. If a new or optimized software version solves the issue, those sites may receive it early.

Depending on how critical the situation is, someone may go on-site and sit next to the system during installation so that any problem is recognized immediately.

Participant: So someone effectively babysits the update.

Expert: Yes.

Participant: With more capable AI models, cybersecurity vulnerabilities may be discovered faster. If a major vulnerability appears in a CT or C-arm—for example, something like [the specific exploit name is unclear]—how quickly can you react? What slows down the response once the issue is known?

Expert: We had the WannaCry situation, for example. The answer depends partly on who needs to provide the fix.

If the issue is in the operating system, we have to wait for Microsoft to provide a patch. They are usually quite fast, but validating it is still our responsibility.

Our biggest challenge is the variety of systems and configurations. We need to make sure the update works across all the relevant hardware and software combinations. That involves a lot of testing, and it cannot simply be skipped.

We are working on things such as digital twins and improvements to the testing pipeline to make that process faster.

Participant: Returning to the challenge: how do you communicate an urgent update to the hospital? You send letters and emails, and perhaps technicians for very critical cases. Hospitals also do not want to be in the news because they were hacked.

Expert: With our systems, customers get access to teamplay Fleet, our fleet-management platform. It lists their Siemens systems and displays a message when an update is available.

But the responsibility is distributed. The person using teamplay Fleet is usually in biomedical engineering or IT. They also receive a letter explaining, for example, that an update fixes a security issue and a couple of user-interface problems.

I am not sure whether they can see there that the physical system has already downloaded the software package. I would have to check that.

Participant: So it is primarily reporting availability?

Expert: Yes. They cannot start the update from there. Someone must be physically at the system to press the update button. The people informed through fleet management are not necessarily the operators.

The question is always: who does what? Even during initial installation, the engineer needs information about how to configure everything. The users often say, “I need to ask someone else.”

More and more hospitals use third-party IT providers located hundreds of kilometres away. Then somebody has to open a ticket to obtain the required configuration or network information.

The person standing at the machine often thinks, “I need to take care of my patients. I do not see this as my responsibility.” Some are also afraid to click unfamiliar buttons because they do not know what will happen.

For example, clicking here already takes a little while to produce a response. Some users rarely interact with IT beyond what they need for their work. Then they see an estimated update time of 120 minutes and ask, “When am I supposed to find two hours during the day?”

Even displaying the estimated duration can cause them to defer it: “I have several procedures today. We will see later.”

Participant: Can we try the installation?

Expert: We can check later in one of the booked slots. It should be a dummy update and should run quite quickly, but we will not start it right now.

Participant: One quick piece of feedback: if clicking that button takes ten seconds before anything visibly happens, show an immediate loading indicator. People are already anxious about pressing it. The interface should make it clear that the system is responding.

Expert: That is a major issue with medical-device interfaces. Surgeons are under time pressure. If nothing happens, they may think the system is broken, switch it off, ask for another one, or stop using it because they cannot tell what it is doing.

Suppose something stops working as expected: radiation is unavailable, the application behaves incorrectly, or there is another problem. The customer can send logs or initiate remote support.

Unfortunately, that is not directly accessible from the live view. They first need to leave that view and open another part of the interface, such as the settings, to find the log-transfer option.

Here they can select the current logs or other log packages. You can also see the USB option. In the ideal case, connectivity is working, so they select the logs, click “Okay,” and send them to the backend.

An engineer can then download and analyze the files and call the customer with a likely explanation or next step.

With a poor connection, it takes longer. Even with a connection, users may not want to do this during a procedure because it occupies the main interface while the surgeon wants to continue.

The USB route is more cumbersome. They need an approved USB device, insert it, export the logs, remove it, find a PC, and send the files. Depending on local policy, USB may not even be allowed. In practice, that process often does not happen.

Expert: In the service menu, you can configure regular automatic log uploads—for example, whenever the system starts. The manual workflow is useful when automatic uploads have not been configured, or when an immediate problem requires a fresh set of logs.

What often happens is that the customer calls us and says the system is not working. We ask, “Can you send the logs?”

They say, “No, I already switched it off.”

“Could you go back to the system?”

“I don't have time for that. I'll do it tomorrow or next week.”

Then the ticket sits idle because we have no information to diagnose the problem.

Sometimes we eventually receive a large collection of logs and have to find the relevant files. The logs are fairly generic and do not contain patient data. They record many of the actions performed on the system—something like a flight recorder.

Participant: Can users open a support ticket from this interface?

Expert: No.

Participant: Why not?

Expert: The system might not be connected, so the ticket could not be submitted.

Participant: You could display that: “The ticket has not been sent because there is no connection. Please connect the system or move it somewhere with network access.” You could also attach screenshots.

Expert: Those are valid questions. The other constraint is that you cannot show disruptive interactions during a live procedure. One of the main rules in this environment is not to disturb the user's work.

Participant: Can you track what people do with the system during a procedure? You mentioned a flight recorder.

Expert: Yes. It records system actions and button presses. There is a tool that can load the logs and provide a basic visual representation of what was done—for example, when X-rays were released and what happened before an error.

It does not contain every possible detail. There are also different logs for the user interface, the imaging PC, and the subsystems with which it communicates.

For example, you can see a response from the generator indicating that some limit was exceeded. You can trace the chain of events and investigate why radiation was not released: what the user pressed, what the imaging PC sent, and how the generator responded.

There are many possible failure points in a distributed system. You need information from the different components to understand where the problem began.

Participant: How often does a ticket turn out to be an operating error rather than a defect in the system? “Fault” is perhaps too harsh a word—incorrect use, for example.

Expert: It happens, but I do not have a statistic. Sometimes a reboot resolves the issue.

I have also visited customers who say, “Whenever I do this, it doesn't work,” and then it works while I am there. They may be a little more relaxed and leave a slightly longer interval between button presses. That timing difference can be enough to change the behavior. [The exact example timings are unclear.]

Participant: Does the X-ray operator log in? Do you identify who is using the system?

Expert: Individual login is an option, sometimes associated with a licence, but only a small number of systems use it.

Participant: So you generally cannot create individualized training based on a particular person's usage logs.

Expert: Even where accounts are available, customers may use shared accounts rather than creating one for every person.

In Germany, works councils can also object to individual tracking because it could be used to monitor employee performance or mistakes. Individual identification is more common in certain US settings, such as military hospitals, where there are specific requirements.

Participant: You still have logs, information from escalations, and a resolution history for each ticket. Could you use those to identify common errors and operating difficulties, both for product development and for training materials—perhaps short learning modules sent to operators?

Expert: Not to the extent I would like. We try to do that, but it is not yet a routine process.

One challenge is data retention. Logs are sent to centralized servers—I think there are three around the world—but they are not kept indefinitely. If a log is not accessed for about two weeks, it is deleted.

That is partly about storage volume and partly about data protection. It is more like a rolling buffer than a permanent archive.

Participant: Could an algorithm extract the important information before the underlying logs are deleted?

Expert: Potentially. What we do not have is a complete pool of logs from last Christmas to this Christmas that we can analyze once a year to find recurring problems and translate them into training.

Participant: Doesn't the hospital have to retain an auditable record of the procedure in case of a legal claim?

Expert: Yes, but that does not mean retaining all of this machine data. With X-ray systems, dose reporting is one of the records they need to keep.

Participant: What about offline or air-gapped sites? How do you get logs from them?

Expert: Someone has to go there and retrieve them. If no connection is permitted, there is nothing we can do remotely.

It would be useful to have a way to access more of those systems remotely, but some customers—including some in China—simply do not allow their systems to be connected.

Participant: Is that a problem with network coverage? If the system were moved outside the hospital or somewhere else, could it connect?

Expert: In those cases, it is the hospital's policy that prohibits the connection. Moving the system does not solve that.

Participant: Understood. If they do not allow a connection, we have to respect that. But covering the other hospitals would already be a large improvement.

Expert: Exactly. If the logs show that something is physically broken, someone still has to go on-site. If the problem is less serious, remote access may help.

There are different remote-session options, including access to the service interface and the user's view. Everything needs to be configured correctly. The customer provides an ID and password, and the engineer can connect, see the interface, and discuss or investigate the problem.

Even if the connection is technically available during a patient examination, remote access during an active procedure is normally not permitted for regulatory reasons.

Participant: For restricted customers such as military hospitals, do Siemens engineers perform the work, or can contractors or independent service organizations do it?

Expert: It depends on the country, the hospital, the contract, and the customer's requirements.

If a hospital has twenty or twenty-five systems, it may make sense to have dedicated technicians. Some large hospitals have one or two people employed by Siemens but permanently based at the hospital. They look after a large fleet of CT, MRI, and other systems and stay quite busy.

Participant: So there are three broad groups: Siemens employees, external partners contracted by Siemens, and independent third parties hired by customers. We also have to provide appropriate access for independent service under right-to-repair requirements.

Expert: Some customers send their biomedical engineers to us for training, too. We train them to perform certain basic service tasks themselves, up to a defined level.

Participant: Just to clarify the abbreviation: ISO means independent service organization.

Expert: Yes.

[A short exchange about obtaining logs through independent service providers is unclear.]

Expert: For remote sessions, someone usually needs to be at the system, which makes coordination cumbersome.

Think about the end of a procedure. If connectivity is good, staff can send the images to the archive immediately. If there is no connection in the room, they may have to disconnect everything, move the system into the hallway, reconnect it, boot it up, and send the images.

Once that is finished, they cannot necessarily leave the system in the hallway. They disconnect it again, move it into a storage room, push it in, and leave it switched off.

How can we make it easier for them to keep it plugged in and connected?

Expert: As I told the other group, the challenge has two parts.

First, identify the golden windows of opportunity when someone is willing and able to press the update button, and reduce their anxiety about doing so.

Second, establish connectivity to our backend even while the main system is switched off and parked somewhere.

Additional hardware could be part of the solution—a mini PC or another device that communicates with the backend independently of the main system.

Please do not limit yourselves to the architecture we currently have. It is useful to understand what is and is not possible today. But if your solution needs something additional, state that requirement.

Your task is not to turn it into a finished product here. Your task is to propose an idea and show us a way that could solve the challenge.

You can book half-hour slots through the Discord server between one and six. We will be here, and you can ask us to show you particular functions or discuss more specific questions.

Participant: Any other questions? What is the thing you would most wish for?

[Someone enters the room, prompting a brief joke about appearing unexpectedly through the doorway.]

Expert: In my work, I have been a customer, an application specialist, a remote application specialist, and now a trainer. A lot of the work is guiding customers through simple steps.

I would like a good way to guide people through those steps—highlighting what to press or showing a short explanation of how to do something.

Participant: How long have you worked here?

Expert: Six years.

Participant: What approach or experiment have you tried that did not work, but that you wish had worked?

Expert: [Opening response unclear.] The frustrating thing is that customers can struggle even with the most basic actions. My wish is not necessarily for something fancy or complicated.

Sometimes you are on the phone trying to explain a very simple step to someone who is uncomfortable with technology, and even that is difficult.

Participant: Like watching someone use a video-call application and thinking, “This should have taken one minute, but we have spent ten on it.”

Expert: Exactly. Time is money.

Windows security updates alone cost us a lot of money because we sometimes send engineers on-site to install them when we cannot rely on the customer to do it.

Participant: Why do you use Windows?

Expert: That is largely historical.

Participant: Is it also a reliability or responsibility question—having an operating-system vendor to turn to?

Expert: The platform has grown over time.

Participant: I recently heard about a company building its own operating system for a particular purpose. [The company or product reference is unclear.]

You pay Microsoft licence fees, right? And presumably these are specialized long-term support arrangements.

Expert: Yes. Industrial customers can have longer support periods than ordinary consumer versions. I think one of the longest Windows 10 support periods in our environment runs to 2032. [Date stated from memory.] Microsoft continues to provide updates under those arrangements, and it charges for them.

Some customers care a great deal about this. Others still use systems that are around twenty years old.

Changing the underlying operating system on one of these systems is like open-heart surgery. Whatever can go wrong tends to go wrong.

Participant: Backward compatibility is not guaranteed either.

Expert: Exactly. Some product lines have gone through four or five PC generations with different hardware. Not every operating system works with every hardware generation, especially the older ones.

For a system we still sell, there may be four generations in the field: a very old PC you can no longer buy, another generation that has reached its last-time-buy stage, and newer machines. At one point, we also switched PC brands. We now use HP hardware in some systems.

The supplier changes its PCs, too. A graphics-card architecture changes, for example, and suddenly that configuration is not tested. Then we need new tests, and perhaps a different CUDA version.

Getting the drivers, Windows, and the rest of the system working together is cumbersome. That is why we try not to change a working configuration unnecessarily. Introducing a new PC creates a lot of work.

Participant: So the computer-swap idea we discussed yesterday would only be straightforward if the replacement had exactly the same configuration?

Expert: It could work with an identical computer. But replacing an early PC revision with a much later one might cause problems. Or it might work—I cannot tell you without testing it.

Participant: And security updates come roughly every ninety days?

Expert: That is the intended cadence for vulnerability updates. [Part of the exchange about release types and customer agreements is unclear.] Other updates may affect not only the PC but firmware across the entire system.

Participant: The remote sessions are basically like TeamViewer—you can control the interface?

Expert: Yes, along those lines.

Participant: I don't want to keep you any longer. I have already asked a lot. Lunch?

Participant: Thank you very much for your time.

Expert: Thank you.
