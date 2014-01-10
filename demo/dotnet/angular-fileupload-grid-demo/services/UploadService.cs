using System.Threading;
using ServiceStack;

namespace demo.services
{
    public class UploadService : Service
    {
        public object Post(Upload upload)
        {
            Thread.Sleep(1000);

            return base.Request.Files[0].FileName;
        }
    }
}