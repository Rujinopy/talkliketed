import React from "react";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import { policyDate } from "@/utils/siteData"


function conditions() {
    return (
        <div className="">
            <NavbarWithoutCam style="md:flex top-0 z-50 bg-yellow-200" />
            <div className="mt-5 w-screen space-y-3 bg-white p-5 pb-0 md:ml-4 md:w-[50%]">
                <h1 className="text-3xl font-bold ">Motiflex</h1>
                <div>
                    <h1 className="font-bold text-xl">Privacy Policy</h1>
                    <p>Last Updated: {policyDate.date}</p>

                    <p>
                        My name is Athirath, an indie software developer. I operate this site,Motiflex. This page informs
                        you of our policies regarding the collection, use, and disclosure of Personal Information we receive from users
                        of the Site.
                    </p>

                    <h2 className="font-bold text-lg">Information Collection and Use</h2>
                    <p>
                        While using our Site, we may ask you to provide us with certain personally identifiable information that can
                        be used to contact or identify you. Personally identifiable information includes only limited to,
                        your name, email address.
                    </p>

                    <h2 className="font-bold text-lg">Log Data</h2>
                    <p>
                        Like many site operators, we collect information that your browser sends whenever you visit our Site. This Log Data may include information such as your computer&apos;s Internet Protocol address,
                        browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time
                        spent on those pages, and other statistics.
                    </p>

                    <h2 className="font-bold text-lg">Cookies</h2>
                    <p>
                        Cookies are files with a small amount of data, which may include an anonymous unique identifier. Cookies are
                        sent to your browser from a web site and stored on your computer&apos;s hard drive. Like many sites, we use
                        &quot;cookies&quot; to collect information. You can instruct your browser to refuse all cookies or to indicate when a
                        cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our
                        Site.
                    </p>

                    <h2 className="font-bold text-lg">Security</h2>
                    <p>
                        The security of your Personal Information is important to us, but remember that no method of transmission
                        over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially
                        acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                    </p>

                    <h2 className="font-bold text-lg">Changes to This Privacy Policy</h2>
                    <p>
                        This Privacy Policy is effective as of {policyDate.date} and will remain in effect except with respect to any changes in
                        its provisions in the future, which will be in effect immediately after being posted on this page. We reserve
                        the right to update or change our Privacy Policy at any time, and you should check this Privacy Policy
                        periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this
                        page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the
                        modified Privacy Policy.
                    </p>

                    <h2 className="font-bold text-lg">Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact me at @Rujinopy(twitter instagram and discord) or athirath_y@kkumail.com (email)</p>
                </div>
            </div>
        </div>
    );
}

export default conditions;
