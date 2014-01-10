using System;
using System.Web;
using demo.services;
using Funq;
using ServiceStack;

namespace demo
{
    public class Global : HttpApplication
    {
        public class AppHost : AppHostBase
        {
            //Tell Service Stack the name of your application and where to find your web services
            public AppHost() : base("Demo Services", typeof(FileService).Assembly) { }

            public override void Configure(Container container)
            {
            }
        }

        //Initialize your application singleton
        protected void Application_Start(object sender, EventArgs e)
        {
            new AppHost().Init();
        }
    }
}